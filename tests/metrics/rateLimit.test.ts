import { computeRateLimitMetrics } from '../../src/metrics/rateLimit'
import { exampleRateLimitMetrics, exampleRateLimitResponse } from './fixtures/rateLimit'

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
