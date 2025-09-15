import { v1 } from '@datadog/datadog-api-client'
import { WorkflowJobCompletedEvent } from '@octokit/webhooks-types'
import { WorkflowRun } from './queries.js'

type JobMetricsOptions = {
  preferDistributionJobMetrics: boolean
}

export type WorkflowJobMetrics = {
  series: v1.Series[]
  distributionPointsSeries: v1.DistributionPointsSeries[]
}

const joinRunsOn = (labels: string[]): string => labels.sort().join(',')

const getCommonMetricsTags = (e: WorkflowJobCompletedEvent, workflowRun: WorkflowRun): string[] => [
  `repository_owner:${e.repository.owner.login}`,
  `repository_name:${e.repository.name}`,
  `workflow_id:${workflowRun.id}`,
  `workflow_name:${workflowRun.name}`,
  `run_attempt:${workflowRun.run_attempt}`,
  `event:${workflowRun.event}`,
  `sender:${e.sender.login}`,
  `sender_type:${e.sender.type}`,
  `branch:${workflowRun.head_branch}`,
  `default_branch:${(workflowRun.head_branch === e.repository.default_branch).toString()}`,
  ...workflowRun.pull_requests.map((pull) => `pull_request_number:${pull.number}`),
  `job_id:${String(e.workflow_job.id)}`,
  `job_name:${e.workflow_job.name}`,
  `conclusion:${e.workflow_job.conclusion}`,
  `status:${e.workflow_job.status}`,
  `runs_on:${joinRunsOn(e.workflow_job.labels)}`,
]

const getCommonDistributionPointsTags = (e: WorkflowJobCompletedEvent, workflowRun: WorkflowRun): string[] => [
  `repository_owner:${e.repository.owner.login}`,
  `repository_name:${e.repository.name}`,
  `workflow_name:${workflowRun.name}`,
  `run_attempt:${workflowRun.run_attempt}`,
  `event:${workflowRun.event}`,
  `sender:${e.sender.login}`,
  `sender_type:${e.sender.type}`,
  `branch:${workflowRun.head_branch}`,
  `default_branch:${(workflowRun.head_branch === e.repository.default_branch).toString()}`,
  ...workflowRun.pull_requests.map((pull) => `pull_request_number:${pull.number}`),
  `job_name:${e.workflow_job.name}`,
  `conclusion:${e.workflow_job.conclusion}`,
  `status:${e.workflow_job.status}`,
  `runs_on:${joinRunsOn(e.workflow_job.labels)}`,
]

export const computeWorkflowJobMetrics = (
  e: WorkflowJobCompletedEvent,
  workflowRun: WorkflowRun,
  opts: JobMetricsOptions,
): WorkflowJobMetrics => {
  const series: v1.Series[] = []
  const distributionPointsSeries: v1.DistributionPointsSeries[] = []

  const tags = getCommonMetricsTags(e, workflowRun)
  const distributionPointsTags = getCommonDistributionPointsTags(e, workflowRun)

  const workflowRunStartedAt = unixTime(workflowRun.run_started_at)
  const jobStartedAt = e.workflow_job.started_at ? unixTime(e.workflow_job.started_at) : null
  const jobCompletedAt = unixTime(e.workflow_job.completed_at!)

  // Job total count
  series.push({
    host: 'github.com',
    tags,
    metric: 'github.actions.job.total',
    type: 'count',
    points: [[jobCompletedAt, 1]],
  })

  // Job conclusion count
  series.push({
    host: 'github.com',
    tags,
    metric: `github.actions.job.conclusion.${e.workflow_job.conclusion}_total`,
    type: 'count',
    points: [[jobCompletedAt, 1]],
  })

  // Job duration (if we have start time)
  if (jobStartedAt) {
    const duration = jobCompletedAt - jobStartedAt

    if (opts.preferDistributionJobMetrics) {
      distributionPointsSeries.push({
        host: 'github.com',
        tags: distributionPointsTags,
        metric: 'github.actions.job.duration_second.distribution',
        points: [[jobCompletedAt, [duration]]],
      })
    } else {
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.duration_second',
        type: 'gauge',
        points: [[jobCompletedAt, duration]],
      })
    }

    // Time from workflow start to job start
    const sinceWorkflowStart = jobStartedAt - workflowRunStartedAt

    if (opts.preferDistributionJobMetrics) {
      distributionPointsSeries.push({
        host: 'github.com',
        tags: distributionPointsTags,
        metric: 'github.actions.job.start_time_from_workflow_start_second.distribution',
        points: [[jobCompletedAt, [sinceWorkflowStart]]],
      })
    } else {
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.start_time_from_workflow_start_second',
        type: 'gauge',
        points: [[jobCompletedAt, sinceWorkflowStart]],
      })
    }
  }

  // Note: WorkflowJobCompletedEvent doesn't include step-level information
  // For step metrics, we would need to use the existing workflow_run event
  // or make additional API calls to get step details

  return { series, distributionPointsSeries }
}

const unixTime = (s: string): number => Date.parse(s) / 1000
