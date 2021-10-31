import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { PullRequestClosedEvent, PullRequestEvent, PullRequestOpenedEvent } from '@octokit/webhooks-types'

export const computePullRequestMetrics = (e: PullRequestEvent): Series[] | null => {
  if (e.action === 'opened') {
    return computePullRequestOpenedMetrics(e)
  }
  if (e.action === 'closed') {
    return computePullRequestClosedMetrics(e)
  }
  return null
}

const computeCommonTags = (e: PullRequestEvent): string[] => {
  const tags = [
    `repository_owner:${e.repository.owner.login}`,
    `repository_name:${e.repository.name}`,
    `sender:${e.sender.login}`,
    `sender_type:${e.sender.type}`,
    `user:${e.pull_request.user.login}`,
    `pull_request_number:${e.number}`,
    `draft:${JSON.stringify(e.pull_request.draft)}`,
    `base_ref:${e.pull_request.base.ref}`,
    `head_ref:${e.pull_request.head.ref}`,
  ]
  for (const label of e.pull_request.labels) {
    tags.push(`label:${label.name}`)
  }
  return tags
}

export const computePullRequestOpenedMetrics = (e: PullRequestOpenedEvent): Series[] => {
  const tags = computeCommonTags(e)
  const t = unixTime(e.pull_request.created_at)
  return [
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_opened.total',
      type: 'count',
      points: [[t, 1]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_opened.commits',
      type: 'count',
      points: [[t, e.pull_request.commits]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_opened.changed_files',
      type: 'count',
      points: [[t, e.pull_request.changed_files]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_opened.additions',
      type: 'count',
      points: [[t, e.pull_request.additions]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_opened.deletions',
      type: 'count',
      points: [[t, e.pull_request.deletions]],
    },
  ]
}

export const computePullRequestClosedMetrics = (e: PullRequestClosedEvent): Series[] => {
  const tags = computeCommonTags(e)
  tags.push(`merged:${JSON.stringify(e.pull_request.merged)}`)

  const t = unixTime(e.pull_request.closed_at)
  return [
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.total',
      type: 'count',
      points: [[t, 1]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.since_opened_seconds',
      type: 'gauge',
      points: [[t, (Date.parse(e.pull_request.closed_at) - Date.parse(e.pull_request.created_at)) / 1000]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.commits',
      type: 'count',
      points: [[t, e.pull_request.commits]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.changed_files',
      type: 'count',
      points: [[t, e.pull_request.changed_files]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.additions',
      type: 'count',
      points: [[t, e.pull_request.additions]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.deletions',
      type: 'count',
      points: [[t, e.pull_request.deletions]],
    },
  ]
}

const unixTime = (s: string): number => new Date(s).getTime() / 1000
