import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { IntakePayloadAccepted } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/IntakePayloadAccepted'
import { run } from '../src/run'
import { exampleListJobsForWorkflowRun } from './workflowRun/fixtures/listJobsForWorkflowRun'
import {
  exampleJobMetrics,
  exampleStepMetrics,
  exampleWorkflowRunMetrics,
  exampleWorkflowRunSimpleMetrics,
} from './workflowRun/fixtures/metrics'
import { exampleWorkflowRunEvent } from './workflowRun/fixtures/workflowRunEvent'
import { exampleRateLimitMetrics, exampleRateLimitResponse } from './rateLimit/fixtures'

jest.mock('@actions/core')

jest.mock('@actions/github')
const octokitMock = {
  rest: {
    actions: {
      listJobsForWorkflowRun: jest.fn(),
    },
    repos: {
      getContent: jest.fn(),
    },
    rateLimit: {
      get: jest.fn(),
    },
  },
}
const getOctokit = github.getOctokit as jest.Mock
getOctokit.mockReturnValue(octokitMock)

jest.mock('@datadog/datadog-api-client')
const metricsApiMock = {
  submitMetrics: jest.fn<Promise<IntakePayloadAccepted>, [v1.MetricsApiSubmitMetricsRequest]>(),
}
const metricsApiConstructor = v1.MetricsApi as jest.Mock
metricsApiConstructor.mockReturnValue(metricsApiMock)

const exampleWorkflow = `
jobs:
  ts:
    runs-on: ubuntu-latest
`

test('run with collectJobMetrics', async () => {
  octokitMock.rest.actions.listJobsForWorkflowRun.mockResolvedValue({
    data: exampleListJobsForWorkflowRun,
  })
  octokitMock.rest.repos.getContent.mockResolvedValue({
    data: {
      type: 'file',
      encoding: 'base64',
      content: Buffer.from(exampleWorkflow).toString('base64'),
    },
  })
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  metricsApiMock.submitMetrics.mockResolvedValue({ status: 'ok' })

  await run(
    {
      eventName: 'workflow_run',
      payload: exampleWorkflowRunEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      githubToken: 'GITHUB_TOKEN',
      githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
      datadogApiKey: 'DATADOG_API_KEY',
      collectJobMetrics: true,
    }
  )
  expect(getOctokit).toBeCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toBeCalledWith({
    body: {
      series: [...exampleWorkflowRunMetrics, ...exampleJobMetrics, ...exampleStepMetrics, ...exampleRateLimitMetrics],
    },
  })
})

test('run', async () => {
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  metricsApiMock.submitMetrics.mockResolvedValue({ status: 'ok' })

  await run(
    {
      eventName: 'workflow_run',
      payload: exampleWorkflowRunEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      githubToken: 'GITHUB_TOKEN',
      githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
      datadogApiKey: 'DATADOG_API_KEY',
      collectJobMetrics: false,
    }
  )
  expect(getOctokit).toBeCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toBeCalledWith({
    body: {
      series: [...exampleWorkflowRunSimpleMetrics, ...exampleRateLimitMetrics],
    },
  })
})
