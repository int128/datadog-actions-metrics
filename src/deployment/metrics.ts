import { v1 } from '@datadog/datadog-api-client'
import { PullRequestResponse } from '../types'
import { DeploymentEvent } from "@octokit/webhooks-types";

const unixTime = (s: string): number => Date.parse(s) / 1000

const computeCommonTags = (e: DeploymentEvent): string[] => {
  const tags = [
    `repository_owner:${e.repository.owner.login}`,
    `repository_name:${e.repository.name}`,
    `sender:${e.sender.login}`,
    `sender_type:${e.sender.type}`,
    `url:${e.deployment.url}`,
    `ref:${e.deployment.ref}`,
    `created_at:${e.deployment.created_at}`,
    `updated_at:${e.deployment.updated_at}`
  ]
  return tags
}

export const computePullRequestDeploymentMetrics = (
    e: DeploymentEvent,
    pr: PullRequestResponse,
): v1.Series[] => {
  const tags = computeCommonTags(e)
  tags.push(`merged:${String(pr.data.merged)}`)
  const t = unixTime(pr.data.created_at)
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
      points: [[t, t - unixTime(pr.data.created_at)]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.commits',
      type: 'count',
      points: [[t, pr.data.commits]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.changed_files',
      type: 'count',
      points: [[t, pr.data.changed_files]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.additions',
      type: 'count',
      points: [[t, pr.data.additions]],
    },
    {
      host: 'github.com',
      tags,
      metric: 'github.actions.pull_request_closed.deletions',
      type: 'count',
      points: [[t, pr.data.deletions]],
    },
  ]

  return series
}
