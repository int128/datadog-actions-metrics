import { computeRateLimitMetrics } from '../../src/rateLimit/metrics'
import { exampleRateLimitMetrics, exampleRateLimitResponse } from './fixtures'

test('run successfully', () => {
  const { series } = computeRateLimitMetrics(
    {
      repo: {
        owner: 'Codertocat',
        repo: 'Hello-World',
      },
    },
    exampleRateLimitResponse,
  )
  expect(series).toStrictEqual(exampleRateLimitMetrics)
})
