import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { RateLimitResponse } from '../types'

type Context = {
  repo: {
    owner: string
    repo: string
  }
}

export const computeRateLimitMetrics = (e: Context, r: RateLimitResponse): Series[] => {
  const now = parseDate(r.headers.date) ?? Math.floor(Date.now() / 1000)
  const tags = [`repository_owner:${e.repo.owner}`, `repository_name:${e.repo.repo}`]

  const series = [
    {
      host: 'github.com',
      tags: [...tags, 'resource:core'],
      metric: 'github.actions.api_rate_limit.remaining',
      type: 'gauge',
      points: [[now, r.data.resources.core.remaining]],
    },
    {
      host: 'github.com',
      tags: [...tags, 'resource:core'],
      metric: `github.actions.api_rate_limit.limit`,
      type: 'gauge',
      points: [[now, r.data.resources.core.limit]],
    },
    {
      host: 'github.com',
      tags: [...tags, 'resource:search'],
      metric: 'github.actions.api_rate_limit.remaining',
      type: 'gauge',
      points: [[now, r.data.resources.search.remaining]],
    },
    {
      host: 'github.com',
      tags: [...tags, 'resource:search'],
      metric: `github.actions.api_rate_limit.limit`,
      type: 'gauge',
      points: [[now, r.data.resources.search.limit]],
    },
  ]

  if (r.data.resources.graphql) {
    series.push(
      {
        host: 'github.com',
        tags: [...tags, 'resource:graphql'],
        metric: 'github.actions.api_rate_limit.remaining',
        type: 'gauge',
        points: [[now, r.data.resources.graphql.remaining]],
      },
      {
        host: 'github.com',
        tags: [...tags, 'resource:graphql'],
        metric: 'github.actions.api_rate_limit.limit',
        type: 'gauge',
        points: [[now, r.data.resources.graphql.limit]],
      }
    )
  }

  return series
}

const parseDate = (s: string | undefined): number | undefined => {
  if (s === undefined) {
    return
  }
  const t = Date.parse(s)
  if (isNaN(t)) {
    return
  }
  return Math.floor(t / 1000)
}
