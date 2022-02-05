import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { expandSeriesByLabels } from '../../src/pullRequest/expand'

test('empty', () => {
  expect(expandSeriesByLabels([], [])).toStrictEqual([])
})

test('expand series by no label', () => {
  const series: Series[] = [
    {
      metric: 'github.actions.pull_request_closed.total',
      points: [[1579721588, 1]],
    },
    {
      metric: 'github.actions.pull_request_closed.commits',
      points: [[1579721588, 2]],
    },
  ]
  expect(expandSeriesByLabels(series, [])).toStrictEqual(series)
})

test('expand series by 1 label', () => {
  const series: Series[] = [
    {
      metric: 'github.actions.pull_request_closed.total',
      points: [[1579721588, 1]],
    },
    {
      metric: 'github.actions.pull_request_closed.commits',
      points: [[1579721588, 2]],
    },
  ]
  expect(expandSeriesByLabels(series, [{ name: 'app' }])).toStrictEqual([
    {
      metric: 'github.actions.pull_request_closed.total',
      points: [[1579721588, 1]],
      tags: ['label:app'],
    },
    {
      metric: 'github.actions.pull_request_closed.commits',
      points: [[1579721588, 2]],
      tags: ['label:app'],
    },
  ])
})

test('expand series by 2 labels', () => {
  const series: Series[] = [
    {
      metric: 'github.actions.pull_request_closed.total',
      points: [[1579721588, 1]],
    },
    {
      metric: 'github.actions.pull_request_closed.commits',
      points: [[1579721588, 2]],
    },
  ]
  expect(expandSeriesByLabels(series, [{ name: 'app' }, { name: 'critical' }])).toStrictEqual([
    {
      metric: 'github.actions.pull_request_closed.total',
      points: [[1579721588, 1]],
      tags: ['label:app'],
    },
    {
      metric: 'github.actions.pull_request_closed.total',
      points: [[1579721588, 1]],
      tags: ['label:critical'],
    },
    {
      metric: 'github.actions.pull_request_closed.commits',
      points: [[1579721588, 2]],
      tags: ['label:app'],
    },
    {
      metric: 'github.actions.pull_request_closed.commits',
      points: [[1579721588, 2]],
      tags: ['label:critical'],
    },
  ])
})
