import { v1 } from '@datadog/datadog-api-client'
import { GitHubContext, ListWorkflowRunsForRepoRateLimitResponse } from '../types'

export const computeScheduleMetrics = (
  context: GitHubContext,
  queuedWorkflowRuns: ListWorkflowRunsForRepoRateLimitResponse,
  now: Date,
) => {
  const tags = [`repository_owner:${context.repo.owner}`, `repository_name:${context.repo.repo}`]
  const t = now.getTime() / 1000
  const series: v1.Series[] = [
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.schedule.queued_workflow_run.total',
      type: 'gauge',
      points: [[t, queuedWorkflowRuns.data.total_count]],
    },
  ]
  return { series }
}
