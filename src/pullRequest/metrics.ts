import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { PullRequestClosedEvent, PullRequestEvent, PullRequestOpenedEvent } from '@octokit/webhooks-types'
import { ClosedPullRequest } from '../queries/closedPullRequest'
import { expandSeriesByValues } from './expand'

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

type ClosedMetricsOptions = {
  sendPullRequestLabels: boolean
}

export const computePullRequestClosedMetrics = (
  e: PullRequestClosedEvent,
  pr: ClosedPullRequest | undefined,
  options: ClosedMetricsOptions
): Series[] => {
  const tags = computeCommonTags(e)
  tags.push(`merged:${String(e.pull_request.merged)}`)
  const t = unixTime(e.pull_request.closed_at)
  const series = [
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

  if (pr !== undefined) {
    series.push(
      {
        host: 'github.com',
        tags,
        metric: 'github.actions.pull_request_closed.since_first_authored_seconds',
        type: 'gauge',
        points: [[t, t - unixTime(pr.firstCommit.authoredDate)]],
      },
      {
        host: 'github.com',
        tags,
        metric: 'github.actions.pull_request_closed.since_first_committed_seconds',
        type: 'gauge',
        points: [[t, t - unixTime(pr.firstCommit.committedDate)]],
      }
    )
  }

  // Datadog treats a tag as combination of values.
  // For example, if we send a metric with tags `label:foo` and `label:bar`, Datadog will show `label:foo,bar`.
  // Here send a metric for each tag
  let expanded: Series[] = series

  expanded = expandSeriesByValues(
    expanded,
    'requested_team',
    e.pull_request.requested_teams.map((team) => team.name)
  )

  if (options.sendPullRequestLabels) {
    expanded = expandSeriesByValues(
      expanded,
      'label',
      e.pull_request.labels.map((l) => l.name)
    )
  }

  return expanded
}

const unixTime = (s: string): number => Date.parse(s) / 1000
