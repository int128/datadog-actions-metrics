import { v1 } from '@datadog/datadog-api-client'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { CompletedCheckSuite } from '../queries/getCheckSuite'
import { WorkflowJobs } from '../types'

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
  jobMetrics: {
    series: v1.Series[]
    distributionPointsSeries: v1.DistributionPointsSeries[]
  }
  stepMetrics: v1.Series[]
}

export const computeWorkflowRunJobStepMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite?: CompletedCheckSuite,
  workflowJobs?: WorkflowJobs,
): WorkflowRunJobStepMetrics => {
  if (workflowJobs === undefined) {
    return {
      workflowRunMetrics: computeWorkflowRunMetrics(e),
      jobMetrics: {
        series: [],
        distributionPointsSeries: [],
      },
      stepMetrics: [],
    }
  }

  return {
    workflowRunMetrics: computeWorkflowRunMetrics(e),
    jobMetrics: computeJobMetrics(e, workflowJobs, checkSuite),
    stepMetrics: computeStepMetrics(e, workflowJobs),
  }
}

export const computeWorkflowRunMetrics = (e: WorkflowRunCompletedEvent): v1.Series[] => {
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
  return series
}

const joinRunsOn = (labels: string[]): string => labels.sort().join(',')

export const computeJobMetrics = (
  e: WorkflowRunCompletedEvent,
  workflowJobs: WorkflowJobs,
  checkSuite?: CompletedCheckSuite,
) => {
  const series: v1.Series[] = []
  const distributionPointsSeries: v1.DistributionPointsSeries[] = []
  for (const job of workflowJobs.jobs) {
    if (job.completed_at == null) {
      continue
    }
    const createdAt = unixTime(job.created_at)
    const startedAt = unixTime(job.started_at)
    const completedAt = unixTime(job.completed_at)
    const tags = [
      ...computeCommonTags(e),
      `job_id:${String(job.id)}`,
      `job_name:${job.name}`,
      `conclusion:${job.conclusion}`,
      `status:${job.status}`,
      `runs_on:${joinRunsOn(job.labels)}`,
    ]

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
        metric: `github.actions.job.conclusion.${job.conclusion}_total`,
        type: 'count',
        points: [[completedAt, 1]],
      },
    )

    const queuedDuration = startedAt - createdAt
    series.push({
      host: 'github.com',
      tags,
      metric: 'github.actions.job.queued_duration_second',
      type: 'gauge',
      points: [[completedAt, queuedDuration]],
    })
    distributionPointsSeries.push({
      host: 'github.com',
      tags,
      metric: 'github.actions.job.queued_duration_second.distribution',
      type: 'distribution',
      points: [[completedAt, queuedDuration]],
    })

    const duration = completedAt - startedAt
    series.push({
      host: 'github.com',
      tags,
      metric: 'github.actions.job.duration_second',
      type: 'gauge',
      points: [[completedAt, duration]],
    })

    if (checkSuite) {
      const checkRun = checkSuite.node.checkRuns.nodes.find((checkRun) => checkRun.databaseId === job.run_id)
      if (checkRun) {
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
    }
  }
  return { series, distributionPointsSeries }
}

export const isLostCommunicationWithServerError = (message: string): boolean =>
  /^The self-hosted runner: .+? lost communication with the server./.test(message)

export const isReceivedShutdownSignalError = (message: string): boolean =>
  message.startsWith('The runner has received a shutdown signal.')

export const computeStepMetrics = (e: WorkflowRunCompletedEvent, workflowJobs: WorkflowJobs): v1.Series[] => {
  const series: v1.Series[] = []
  for (const job of workflowJobs.jobs) {
    const jobTags = [
      ...computeCommonTags(e),
      `job_id:${String(job.id)}`,
      `job_name:${job.name}`,
      `runs_on:${joinRunsOn(job.labels)}`,
    ]

    for (const step of job.steps ?? []) {
      if (step.started_at == null || step.completed_at == null) {
        continue
      }
      const startedAt = unixTime(step.started_at)
      const completedAt = unixTime(step.completed_at)
      const tags = [
        ...jobTags,
        `step_name:${step.name}`,
        `step_number:${step.number}`,
        `conclusion:${step.conclusion}`,
        `status:${step.status}`,
      ]

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
          metric: `github.actions.step.conclusion.${step.conclusion}_total`,
          type: 'count',
          points: [[completedAt, 1]],
        },
      )

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
