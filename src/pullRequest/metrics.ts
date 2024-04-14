import { v1 } from '@datadog/datadog-api-client'
import { PullRequestClosedEvent, PullRequestEvent, PullRequestOpenedEvent } from '@octokit/webhooks-types'
import { PullRequestFirstCommit } from '../queries/getPullRequest.js'

const computeCommonTags = (e: PullRequestEvent): string[] => {
  const tags = [
    `repository_owner:${e.repository.owner.login}`,
    `repository_name:${e.repository.name}`,
    `sender:${e.sender.login}`,
    `sender_type:${e.sender.type}`,
    `user:${e.pull_request.user.login}`,
    `pull_request_number:${e.number}`,
    `draft:${String(e.pull_request.draft)}`,
    `base_ref:${e.pull_request.base.ref}`,
    `head_ref:${e.pull_request.head.ref}`,
  ]
  return tags
}

export const computePullRequestOpenedMetrics = (e: PullRequestOpenedEvent): v1.Series[] => {
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

type ClosedMetricsOptions = {
  sendPullRequestLabels: boolean
}

export const computePullRequestClosedMetrics = (
  e: PullRequestClosedEvent,
  pullRequestFirstCommit: PullRequestFirstCommit | undefined,
  options: ClosedMetricsOptions,
): v1.Series[] => {
  const tags = computeCommonTags(e)
  tags.push(`merged:${String(e.pull_request.merged)}`)
  const t = unixTime(e.pull_request.closed_at)
  const series: v1.Series[] = [
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
      points: [[t, t - unixTime(e.pull_request.created_at)]],
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

  if (pullRequestFirstCommit !== undefined) {
    series.push(
      {
        host: 'github.com',
        tags,
        metric: 'github.actions.pull_request_closed.since_first_authored_seconds',
        type: 'gauge',
        points: [[t, t - unixTime(pullRequestFirstCommit.authoredDate)]],
      },
      {
        host: 'github.com',
        tags,
        metric: 'github.actions.pull_request_closed.since_first_committed_seconds',
        type: 'gauge',
        points: [[t, t - unixTime(pullRequestFirstCommit.committedDate)]],
      },
    )
  }

  // TODO: investigate how to analyze multi-value tag in Datadog
  //
  // When it sends multiple values, Datadog will show the tag as combination of values.
  // For example, it sends `label:x` and `label:y`, Datadog will show it as `label:x,y`.
  // Don't send each metric for a tag value, because sum of count metric would be wrong value.
  for (const requested_team of e.pull_request.requested_teams) {
    tags.push(`requested_team:${requested_team.name}`)
  }
  if (options.sendPullRequestLabels) {
    for (const label of e.pull_request.labels) {
      tags.push(`label:${label.name}`)
    }
  }

  return series
}

const unixTime = (s: string): number => Date.parse(s) / 1000
