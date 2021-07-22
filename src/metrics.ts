import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { WorkflowRunEvent } from '@octokit/webhooks-definitions/schema'

export const computeWorkflowRunMetrics = (e: WorkflowRunEvent): Series[] => {
  const updatedAt = new Date(e.workflow_run.updated_at).getTime() / 1000
  const tags = [
    `repository_owner:${e.workflow_run.repository.owner.login}`,
    `repository_name:${e.workflow_run.repository.name}`,
    `workflow_name:${e.workflow_run.name}`,
    `event:${e.workflow_run.event}`,
    `conclusion:${e.workflow_run.conclusion}`,
    `branch:${e.workflow_run.head_branch}`,
    `default_branch:${e.workflow_run.head_branch === e.repository.default_branch}`,
  ]
  return [
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
}
