import * as core from '@actions/core'
import { v1 } from '@datadog/datadog-api-client'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { inferRunner, parseWorkflowFile, WorkflowDefinition } from './parse'
import { CompletedCheckSuite } from '../queries/completedCheckSuite'

const computeCommonTags = (e: WorkflowRunCompletedEvent): string[] => [
  `repository_owner:${e.workflow_run.repository.owner.login}`,
  `repository_name:${e.workflow_run.repository.name}`,
  `workflow_id:${e.workflow_run.id}`,
  `workflow_name:${e.workflow_run.name}`,
  `run_attempt:${e.workflow_run.run_attempt}`,
  `event:${e.workflow_run.event}`,
  `sender:${e.sender.login}`,
  `sender_type:${e.sender.type}`,
  `branch:${e.workflow_run.head_branch}`,
  `default_branch:${(e.workflow_run.head_branch === e.repository.default_branch).toString()}`,
  ...e.workflow_run.pull_requests.map((pull) => `pull_request_number:${pull.number}`),
]

export type WorkflowRunJobStepMetrics = {
  workflowRunMetrics: v1.Series[]
  jobMetrics: v1.Series[]
  stepMetrics: v1.Series[]
}

export const computeWorkflowRunJobStepMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite?: CompletedCheckSuite
): WorkflowRunJobStepMetrics => {
  if (checkSuite === undefined) {
    return { workflowRunMetrics: computeWorkflowRunMetrics(e), jobMetrics: [], stepMetrics: [] }
  }

  let workflowDefinition
  try {
    workflowDefinition = parseWorkflowFile(checkSuite.node.commit.file.object.text)
  } catch (error) {
    core.warning(`Invalid workflow file: ${String(error)}`)
  }
  if (workflowDefinition) {
    core.info(`Found ${Object.keys(workflowDefinition.jobs).length} job(s) in the workflow file`)
  }

  return {
    workflowRunMetrics: computeWorkflowRunMetrics(e, checkSuite),
    jobMetrics: computeJobMetrics(e, checkSuite, workflowDefinition),
    stepMetrics: computeStepMetrics(e, checkSuite, workflowDefinition),
  }
}

export const computeWorkflowRunMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite?: CompletedCheckSuite
): v1.Series[] => {
  const tags = [...computeCommonTags(e), `conclusion:${e.workflow_run.conclusion}`]
  const updatedAt = unixTime(e.workflow_run.updated_at)
  const series: v1.Series[] = [
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.workflow_run.total',
      type: 'count',
      points: [[updatedAt, 1]],
    },
    {
      host: 'github.com',
      tags,
      metric: `github.actions.workflow_run.conclusion.${e.workflow_run.conclusion}_total`,
      type: 'count',
      points: [[updatedAt, 1]],
    },
  ]

  const runStartedAt = unixTime(e.workflow_run.run_started_at)
  const duration = updatedAt - runStartedAt
  series.push({
    host: 'github.com',
    tags,
    metric: 'github.actions.workflow_run.duration_second',
    type: 'gauge',
    points: [[updatedAt, duration]],
  })

  if (checkSuite !== undefined) {
    const firstJobStartedAt = Math.min(...checkSuite.node.checkRuns.nodes.map((j) => unixTime(j.startedAt)))
    const queued = firstJobStartedAt - runStartedAt
    series.push({
      host: 'github.com',
      tags,
      metric: 'github.actions.workflow_run.queued_duration_second',
      type: 'gauge',
      points: [[updatedAt, queued]],
    })
  }
  return series
}

export const computeJobMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite: CompletedCheckSuite,
  workflowDefinition?: WorkflowDefinition
): v1.Series[] => {
  const series: v1.Series[] = []
  for (const checkRun of checkSuite.node.checkRuns.nodes) {
    // lower case for backward compatibility
    const conclusion = String(checkRun.conclusion).toLowerCase()
    const status = String(checkRun.status).toLowerCase()

    const completedAt = unixTime(checkRun.completedAt)
    const tags = [
      ...computeCommonTags(e),
      `job_id:${String(checkRun.databaseId)}`,
      `job_name:${checkRun.name}`,
      `conclusion:${conclusion}`,
      `status:${status}`,
    ]
    const runsOn = inferRunner(checkRun.name, workflowDefinition)
    if (runsOn !== undefined) {
      tags.push(`runs_on:${runsOn}`)
    }

    series.push(
      {
        host: 'github.com',
        tags,
        metric: 'github.actions.job.total',
        type: 'count',
        points: [[completedAt, 1]],
      },
      {
        host: 'github.com',
        tags,
        metric: `github.actions.job.conclusion.${conclusion}_total`,
        type: 'count',
        points: [[completedAt, 1]],
      }
    )

    const startedAt = unixTime(checkRun.startedAt)
    const duration = completedAt - startedAt
    series.push({
      host: 'github.com',
      tags,
      metric: 'github.actions.job.duration_second',
      type: 'gauge',
      points: [[completedAt, duration]],
    })

    if (checkRun.annotations.nodes.some((a) => isLostCommunicationWithServerError(a.message))) {
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.lost_communication_with_server_error_total',
        type: 'count',
        points: [[completedAt, 1]],
      })
    }

    if (checkRun.annotations.nodes.some((a) => isReceivedShutdownSignalError(a.message))) {
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.received_shutdown_signal_error_total',
        type: 'count',
        points: [[completedAt, 1]],
      })
    }
  }
  return series
}

export const isLostCommunicationWithServerError = (message: string): boolean =>
  /^The self-hosted runner: .+? lost communication with the server./.test(message)

export const isReceivedShutdownSignalError = (message: string): boolean =>
  message.startsWith('The runner has received a shutdown signal.')

export const computeStepMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite: CompletedCheckSuite,
  workflowDefinition?: WorkflowDefinition
): v1.Series[] => {
  const series: v1.Series[] = []
  for (const checkRun of checkSuite.node.checkRuns.nodes) {
    const runsOn = inferRunner(checkRun.name, workflowDefinition)

    for (const s of checkRun.steps.nodes) {
      // lower case for backward compatibility
      const conclusion = String(s.conclusion).toLowerCase()
      const status = String(s.status).toLowerCase()
      const completedAt = unixTime(s.completedAt)
      const tags = [
        ...computeCommonTags(e),
        `job_id:${String(checkRun.databaseId)}`,
        `job_name:${checkRun.name}`,
        `step_name:${s.name}`,
        `step_number:${s.number}`,
        `conclusion:${conclusion}`,
        `status:${status}`,
      ]
      if (runsOn !== undefined) {
        tags.push(`runs_on:${runsOn}`)
      }

      series.push(
        {
          host: 'github.com',
          tags,
          metric: 'github.actions.step.total',
          type: 'count',
          points: [[completedAt, 1]],
        },
        {
          host: 'github.com',
          tags,
          metric: `github.actions.step.conclusion.${conclusion}_total`,
          type: 'count',
          points: [[completedAt, 1]],
        }
      )

      const startedAt = unixTime(s.startedAt)
      const duration = completedAt - startedAt
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.step.duration_second',
        type: 'gauge',
        points: [[completedAt, duration]],
      })
    }
  }
  return series
}

const unixTime = (s: string): number => Date.parse(s) / 1000
