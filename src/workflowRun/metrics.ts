import * as core from '@actions/core'
import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { inferRunner, parseWorkflowFile, WorkflowDefinition } from './parse'
import { CompletedCheckSuite } from '../queries/completedCheckSuite'

const computeCommonTags = (e: WorkflowRunCompletedEvent): string[] => [
  `repository_owner:${e.workflow_run.repository.owner.login}`,
  `repository_name:${e.workflow_run.repository.name}`,
  `workflow_id:${e.workflow_run.id}`,
  `workflow_name:${e.workflow_run.name}`,
  `event:${e.workflow_run.event}`,
  `sender:${e.sender.login}`,
  `sender_type:${e.sender.type}`,
  `branch:${e.workflow_run.head_branch}`,
  `default_branch:${(e.workflow_run.head_branch === e.repository.default_branch).toString()}`,
]

export const computeWorkflowRunJobStepMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite?: CompletedCheckSuite
): Series[] => {
  if (checkSuite === undefined) {
    return computeWorkflowRunMetrics(e)
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

  return [
    ...computeWorkflowRunMetrics(e, checkSuite),
    ...computeJobMetrics(e, checkSuite, workflowDefinition),
    ...computeStepMetrics(e, checkSuite, workflowDefinition),
  ]
}

export const computeWorkflowRunMetrics = (e: WorkflowRunCompletedEvent, checkSuite?: CompletedCheckSuite): Series[] => {
  const tags = [...computeCommonTags(e), `conclusion:${e.workflow_run.conclusion}`]
  const updatedAt = unixTime(e.workflow_run.updated_at)
  const series = [
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

  // queued time is available only on the first run
  if (e.workflow_run.run_attempt === 1) {
    const createdAt = unixTime(e.workflow_run.created_at)
    const queued = createdAt - runStartedAt
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
): Series[] => {
  const series: Series[] = []
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

    if (checkRun.steps.nodes.length > 0) {
      const firstStepStartedAt = Math.min(...checkRun.steps.nodes.map((s) => unixTime(s.startedAt)))
      const queued = firstStepStartedAt - startedAt
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.queued_duration_second',
        type: 'gauge',
        points: [[completedAt, queued]],
      })
    }
  }
  return series
}

export const computeStepMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite: CompletedCheckSuite,
  workflowDefinition?: WorkflowDefinition
): Series[] => {
  const series: Series[] = []
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
