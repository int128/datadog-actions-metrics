import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { PushEvent } from '@octokit/webhooks-types'

export const computePushMetrics = (e: PushEvent, now: Date): Series[] => {
  const tags = [
    `repository_owner:${e.repository.owner.login}`,
    `repository_name:${e.repository.name}`,
    `sender:${e.sender.login}`,
    `sender_type:${e.sender.type}`,
    `ref:${e.ref}`,
    `created:${JSON.stringify(e.created)}`,
    `deleted:${JSON.stringify(e.deleted)}`,
    `forced:${JSON.stringify(e.forced)}`,
    `default_branch:${(e.ref === `refs/heads/${e.repository.default_branch}`).toString()}`,
  ]
  const t = now.getTime() / 1000
  return [
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.push.total',
      type: 'count',
      points: [[t, 1]],
    },
  ]
}
