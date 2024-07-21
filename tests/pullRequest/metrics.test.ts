import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from '../../src/pullRequest/metrics.js'
import { examplePullRequestClosedEvent } from '../fixtures.js'
import { examplePullRequestOpenedEvent } from '../fixtures.js'
import { examplePullRequestFirstCommit } from './fixtures/getPullRequest.js'

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
  const series = computePullRequestClosedMetrics(examplePullRequestClosedEvent, examplePullRequestFirstCommit, {
    sendPullRequestLabels: true,
  })
  expect(series).toMatchSnapshot()
})
