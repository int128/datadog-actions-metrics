import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from '../../src/pullRequest/metrics'
import { examplePullRequestClosedEvent } from '../fixtures'
import { examplePullRequestOpenedEvent } from '../fixtures'
import { exampleClosedPullRequest } from './fixtures/closedPullRequest'

test('computePullRequestOpenedMetrics', () => {
  const series = computePullRequestOpenedMetrics(examplePullRequestOpenedEvent)
  expect(series).toMatchSnapshot()
})

test('computePullRequestClosedMetrics', () => {
  const series = computePullRequestClosedMetrics(examplePullRequestClosedEvent, undefined, {
    sendPullRequestLabels: true,
  })
  expect(series).toMatchSnapshot()
})

test('computePullRequestClosedMetricsWithQuery', () => {
  const series = computePullRequestClosedMetrics(examplePullRequestClosedEvent, exampleClosedPullRequest, {
    sendPullRequestLabels: true,
  })
  expect(series).toMatchSnapshot()
})
