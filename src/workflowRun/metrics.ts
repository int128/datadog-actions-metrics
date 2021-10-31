import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { inferRunner, WorkflowDefinition } from './parse'
import { ListJobsForWorkflowRun } from '../types'

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

export const computeWorkflowRunMetrics = (
  e: WorkflowRunCompletedEvent,
  listJobsForWorkflowRun?: ListJobsForWorkflowRun
): Series[] => {
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

  const createdAt = unixTime(e.workflow_run.created_at)
  const duration = updatedAt - createdAt
  series.push({
    host: 'github.com',
    tags,
    metric: 'github.actions.workflow_run.duration_second',
    type: 'gauge',
    points: [[updatedAt, duration]],
  })

  if (listJobsForWorkflowRun !== undefined && listJobsForWorkflowRun.jobs.length > 0) {
    const firstJobStartedAt = Math.min(...listJobsForWorkflowRun.jobs.map((j) => unixTime(j.started_at)))
    const queued = firstJobStartedAt - createdAt
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
  listJobsForWorkflowRun: ListJobsForWorkflowRun,
  workflowDefinition?: WorkflowDefinition
): Series[] => {
  const series: Series[] = []
  for (const j of listJobsForWorkflowRun.jobs) {
    if (j.completed_at === null) {
      continue
    }

    const completedAt = unixTime(j.completed_at)
    const tags = [
      ...computeCommonTags(e),
      `job_id:${j.id}`,
      `job_name:${j.name}`,
      `conclusion:${j.conclusion ?? 'null'}`,
      `status:${j.status}`,
    ]
    const runsOn = inferRunner(j.name, workflowDefinition)
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
        metric: `github.actions.job.conclusion.${j.conclusion ?? 'null'}_total`,
        type: 'count',
        points: [[completedAt, 1]],
      }
    )

    const startedAt = unixTime(j.started_at)
    const duration = completedAt - startedAt
    series.push({
      host: 'github.com',
      tags,
      metric: 'github.actions.job.duration_second',
      type: 'gauge',
      points: [[completedAt, duration]],
    })

    if (j.steps?.length) {
      const firstStepStartedAt = Math.min(...j.steps.map((s) => (s.started_at ? unixTime(s.started_at) : Infinity)))
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
  listJobsForWorkflowRun: ListJobsForWorkflowRun,
  workflowDefinition?: WorkflowDefinition
): Series[] => {
  const series: Series[] = []
  for (const job of listJobsForWorkflowRun.jobs) {
    if (job.completed_at === null || job.steps === undefined) {
      continue
    }
    const runsOn = inferRunner(job.name, workflowDefinition)

    for (const s of job.steps) {
      if (s.started_at == null || s.completed_at == null) {
        continue
      }

      const completedAt = unixTime(s.completed_at)
      const tags = [
        ...computeCommonTags(e),
        `job_id:${job.id}`,
        `job_name:${job.name}`,
        `step_name:${s.name}`,
        `step_number:${s.number}`,
        `conclusion:${s.conclusion ?? 'null'}`,
        `status:${s.status}`,
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
          metric: `github.actions.step.conclusion.${s.conclusion ?? 'null'}_total`,
          type: 'count',
          points: [[completedAt, 1]],
        }
      )

      const startedAt = unixTime(s.started_at)
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

const unixTime = (s: string): number => new Date(s).getTime() / 1000
