import { computeRateLimitMetrics } from '../../src/rateLimit/metrics.js'
import { exampleRateLimitMetrics, exampleRateLimitResponse } from './fixtures/index.js'

test('run successfully', () => {
  const series = computeRateLimitMetrics(
    {
      repo: {
        owner: 'Codertocat',
        repo: 'Hello-World',
      },
    },
    exampleRateLimitResponse
  )
  expect(series).toStrictEqual(exampleRateLimitMetrics)
})
