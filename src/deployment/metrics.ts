import { v1 } from '@datadog/datadog-api-client'
import { DeploymentEvent } from '@octokit/webhooks-types'

export const computeDeploymentMetrics = (e: DeploymentEvent, now: Date): v1.Series[] => {
  const tags = [
    `repository_owner:${e.repository.owner.login}`,
    `repository_name:${e.repository.name}`,
    `sender:${e.sender.login}`,
    `sender_type:${e.sender.type}`,
    `workflow:${String(e.workflow?.name)}`,
    `started_at:${String(e.workflow_run?.run_started_at)}`,
    `status:${String(e.workflow_run?.status)}`,
    `pull_request:${String(e.workflow_run?.pull_requests)}`,
    `default_branch:${String(e.workflow_run?.head_branch)}`,
  ]
  const t = now.getTime() / 1000
  return [
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.deployment.total',
      type: 'count',
      points: [[t, 1]],
    },
  ]
}
