import { v1 } from '@datadog/datadog-api-client'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { CompletedCheckSuite } from '../queries/getCheckSuite'
import { WorkflowJobs } from '../types'

const getCommonMetricsTags = (e: WorkflowRunCompletedEvent): string[] => [
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

const getCommonDistibutionPointsTags = (e: WorkflowRunCompletedEvent): string[] => [
  `repository_owner:${e.workflow_run.repository.owner.login}`,
  `repository_name:${e.workflow_run.repository.name}`,
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
  workflowRunMetrics: {
    series: v1.Series[]
    distributionPointsSeries: v1.DistributionPointsSeries[]
  }
  jobMetrics: {
    series: v1.Series[]
    distributionPointsSeries: v1.DistributionPointsSeries[]
  }
  stepMetrics: {
    series: v1.Series[]
    distributionPointsSeries: v1.DistributionPointsSeries[]
  }
}

type WorkflowRunJobStepMetricsOptions = WorkflowRunMetricsOptions & JobMetricsOptions & StepMetricsOptions

export const computeWorkflowRunJobStepMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite: CompletedCheckSuite | undefined,
  workflowJobs: WorkflowJobs | undefined,
  opts: WorkflowRunJobStepMetricsOptions,
): WorkflowRunJobStepMetrics => {
  if (workflowJobs === undefined) {
    return {
      workflowRunMetrics: computeWorkflowRunMetrics(e, opts),
      jobMetrics: {
        series: [],
        distributionPointsSeries: [],
      },
      stepMetrics: {
        series: [],
        distributionPointsSeries: [],
      },
    }
  }

  return {
    workflowRunMetrics: computeWorkflowRunMetrics(e, opts),
    jobMetrics: computeJobMetrics(e, workflowJobs, checkSuite, opts),
    stepMetrics: computeStepMetrics(e, workflowJobs, opts),
  }
}

type WorkflowRunMetricsOptions = {
  preferDistributionWorkflowRunMetrics: boolean
}

export const computeWorkflowRunMetrics = (e: WorkflowRunCompletedEvent, opts: WorkflowRunMetricsOptions) => {
  const series: v1.Series[] = []
  const distributionPointsSeries: v1.DistributionPointsSeries[] = []
  const tags = [...getCommonMetricsTags(e), `conclusion:${e.workflow_run.conclusion}`]
  const distributionPointsTags = [...getCommonDistibutionPointsTags(e), `conclusion:${e.workflow_run.conclusion}`]
  const updatedAt = unixTime(e.workflow_run.updated_at)

  series.push(
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
  )

  const runStartedAt = unixTime(e.workflow_run.run_started_at)
  const duration = updatedAt - runStartedAt
  if (opts.preferDistributionWorkflowRunMetrics) {
    distributionPointsSeries.push({
      host: 'github.com',
      tags: distributionPointsTags,
      metric: 'github.actions.workflow_run.duration_second.distribution',
      points: [[updatedAt, [duration]]],
    })
  } else {
    series.push({
      host: 'github.com',
      tags,
      metric: 'github.actions.workflow_run.duration_second',
      type: 'gauge',
      points: [[updatedAt, duration]],
    })
  }
  return { series, distributionPointsSeries }
}

const joinRunsOn = (labels: string[]): string => labels.sort().join(',')

type JobMetricsOptions = {
  preferDistributionJobMetrics: boolean
}

export const computeJobMetrics = (
  e: WorkflowRunCompletedEvent,
  workflowJobs: WorkflowJobs,
  checkSuite: CompletedCheckSuite | undefined,
  opts: JobMetricsOptions,
) => {
  const workflowRunStartedAt = unixTime(e.workflow_run.run_started_at)
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
      ...getCommonMetricsTags(e),
      `job_id:${String(job.id)}`,
      `job_name:${job.name}`,
      `conclusion:${job.conclusion}`,
      `status:${job.status}`,
      `runs_on:${joinRunsOn(job.labels)}`,
    ]
    const distributionPointsTags = [
      ...getCommonDistibutionPointsTags(e),
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
    if (queuedDuration > 0) {
      // queuedDuration may be negative when the job is rerun
      if (opts.preferDistributionJobMetrics) {
        distributionPointsSeries.push({
          host: 'github.com',
          tags: distributionPointsTags,
          metric: 'github.actions.job.queued_duration_second.distribution',
          points: [[completedAt, [queuedDuration]]],
        })
      } else {
        series.push({
          host: 'github.com',
          tags,
          metric: 'github.actions.job.queued_duration_second',
          type: 'gauge',
          points: [[completedAt, queuedDuration]],
        })
      }
    }

    const duration = completedAt - startedAt
    if (opts.preferDistributionJobMetrics) {
      distributionPointsSeries.push({
        host: 'github.com',
        tags: distributionPointsTags,
        metric: 'github.actions.job.duration_second.distribution',
        points: [[completedAt, [duration]]],
      })
    } else {
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.duration_second',
        type: 'gauge',
        points: [[completedAt, duration]],
      })
    }

    const sinceWorkflowStart = startedAt - workflowRunStartedAt
    if (opts.preferDistributionJobMetrics) {
      distributionPointsSeries.push({
        host: 'github.com',
        tags: distributionPointsTags,
        metric: 'github.actions.job.start_time_from_workflow_start_second.distribution',
        points: [[completedAt, [sinceWorkflowStart]]],
      })
    } else {
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.start_time_from_workflow_start_second',
        points: [[completedAt, sinceWorkflowStart]],
      })
    }

    if (checkSuite) {
      const checkRun = checkSuite.node.checkRuns.nodes.find((checkRun) => checkRun.databaseId === job.id)
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

type StepMetricsOptions = {
  preferDistributionStepMetrics: boolean
}

export const computeStepMetrics = (
  e: WorkflowRunCompletedEvent,
  workflowJobs: WorkflowJobs,
  opts: StepMetricsOptions,
) => {
  const workflowRunStartedAt = unixTime(e.workflow_run.run_started_at)
  const series: v1.Series[] = []
  const distributionPointsSeries: v1.DistributionPointsSeries[] = []
  for (const job of workflowJobs.jobs) {
    for (const step of job.steps ?? []) {
      if (step.started_at == null || step.completed_at == null) {
        continue
      }
      const startedAt = unixTime(step.started_at)
      const completedAt = unixTime(step.completed_at)
      const tags = [
        ...getCommonMetricsTags(e),
        `job_id:${String(job.id)}`,
        `job_name:${job.name}`,
        `runs_on:${joinRunsOn(job.labels)}`,
        `step_name:${step.name}`,
        `step_number:${step.number}`,
        `conclusion:${step.conclusion}`,
        `status:${step.status}`,
      ]
      const distributionPointsTags = [
        ...getCommonDistibutionPointsTags(e),
        `job_name:${job.name}`,
        `runs_on:${joinRunsOn(job.labels)}`,
        `step_name:${step.name}`,
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
      if (opts.preferDistributionStepMetrics) {
        distributionPointsSeries.push({
          host: 'github.com',
          tags: distributionPointsTags,
          metric: 'github.actions.step.duration_second.distribution',
          points: [[completedAt, [duration]]],
        })
      } else {
        series.push({
          host: 'github.com',
          tags,
          metric: 'github.actions.step.duration_second',
          type: 'gauge',
          points: [[completedAt, duration]],
        })
      }

      const sinceWorkflowStart = startedAt - workflowRunStartedAt
      if (opts.preferDistributionStepMetrics) {
        distributionPointsSeries.push({
          host: 'github.com',
          tags: distributionPointsTags,
          metric: 'github.actions.step.start_time_from_workflow_start_second.distribution',
          points: [[completedAt, [sinceWorkflowStart]]],
        })
      } else {
        series.push({
          host: 'github.com',
          tags,
          metric: 'github.actions.step.start_time_from_workflow_start_second',
          points: [[completedAt, sinceWorkflowStart]],
        })
      }
    }
  }
  return { series, distributionPointsSeries }
}

const unixTime = (s: string): number => Date.parse(s) / 1000
