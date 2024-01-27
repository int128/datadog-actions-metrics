import { v1 } from '@datadog/datadog-api-client'
import { PushEvent } from '@octokit/webhooks-types'

export const computePushMetrics = (e: PushEvent, now: Date) => {
  const tags = [
    `repository_owner:${e.repository.owner.login}`,
    `repository_name:${e.repository.name}`,
    `sender:${e.sender.login}`,
    `sender_type:${e.sender.type}`,
    `ref:${e.ref}`,
    `created:${String(e.created)}`,
    `deleted:${String(e.deleted)}`,
    `forced:${String(e.forced)}`,
    `default_branch:${(e.ref === `refs/heads/${e.repository.default_branch}`).toString()}`,
  ]
  const t = now.getTime() / 1000
  const series: v1.Series[] = [
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.push.total',
      type: 'count',
      points: [[t, 1]],
    },
  ]
  return { series }
}
