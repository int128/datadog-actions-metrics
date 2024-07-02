import { v1 } from '@datadog/datadog-api-client'
import { RateLimitResponse } from '../../../src/types.js'

export const exampleRateLimitResponse: RateLimitResponse = {
  url: 'https://api.example.com',
  status: 200,
  headers: {
    date: 'Wed, 21 Oct 2015 07:28:00 GMT',
  },
  data: {
    rate: {
      limit: 5000,
      used: 1001,
      remaining: 3999,
      reset: 123456789,
    },
    resources: {
      core: {
        limit: 5000,
        used: 1001,
        remaining: 3999,
        reset: 123456789,
      },
      search: {
        limit: 6000,
        used: 5001,
        remaining: 999,
        reset: 123456789,
      },
      graphql: {
        limit: 7000,
        used: 2001,
        remaining: 4999,
        reset: 123456789,
      },
    },
  },
}

const now = 1445412480

export const exampleRateLimitMetrics: v1.Series[] = [
  {
    host: 'github.com',
    tags: ['repository_owner:Codertocat', 'repository_name:Hello-World', 'resource:core'],
    metric: 'github.actions.api_rate_limit.remaining',
    type: 'gauge',
    points: [[now, 3999]],
  },
  {
    host: 'github.com',
    tags: ['repository_owner:Codertocat', 'repository_name:Hello-World', 'resource:core'],
    metric: 'github.actions.api_rate_limit.limit',
    type: 'gauge',
    points: [[now, 5000]],
  },
  {
    host: 'github.com',
    tags: ['repository_owner:Codertocat', 'repository_name:Hello-World', 'resource:search'],
    metric: 'github.actions.api_rate_limit.remaining',
    type: 'gauge',
    points: [[now, 999]],
  },
  {
    host: 'github.com',
    tags: ['repository_owner:Codertocat', 'repository_name:Hello-World', 'resource:search'],
    metric: 'github.actions.api_rate_limit.limit',
    type: 'gauge',
    points: [[now, 6000]],
  },
  {
    host: 'github.com',
    tags: ['repository_owner:Codertocat', 'repository_name:Hello-World', 'resource:graphql'],
    metric: 'github.actions.api_rate_limit.remaining',
    type: 'gauge',
    points: [[now, 4999]],
  },
  {
    host: 'github.com',
    tags: ['repository_owner:Codertocat', 'repository_name:Hello-World', 'resource:graphql'],
    metric: 'github.actions.api_rate_limit.limit',
    type: 'gauge',
    points: [[now, 7000]],
  },
]
