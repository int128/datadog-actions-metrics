import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from '../../src/pullRequest/metrics'
import { examplePullRequestClosedEvent } from './fixtures/closed'
import { examplePullRequestOpenedEvent } from './fixtures/opened'

test('computePullRequestOpenedMetrics', () => {
  const series = computePullRequestOpenedMetrics(examplePullRequestOpenedEvent)
  expect(series).toMatchSnapshot()
})

test('computePullRequestClosedMetrics', () => {
  const series = computePullRequestClosedMetrics(examplePullRequestClosedEvent)
  expect(series).toMatchSnapshot()
})
