import { ClosedPullRequest } from '../../src/queries/closedPullRequest'
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

test('computePullRequestClosedMetricsWithQuery', () => {
  const pr: ClosedPullRequest = {
    firstCommit: {
      authoredDate: '2019-05-15T15:00:11Z',
      committedDate: '2019-05-15T15:11:22Z',
    },
  }
  const series = computePullRequestClosedMetrics(examplePullRequestClosedEvent, pr)
  expect(series).toMatchSnapshot()
})
