import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from '../../src/pullRequest/metrics'
import { examplePullRequestClosedEvent } from '../fixtures'
import { examplePullRequestOpenedEvent } from '../fixtures'
import { examplePullRequestFirstCommit } from './fixtures/getPullRequest'

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
