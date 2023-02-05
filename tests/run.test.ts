import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { run } from '../src/run'
import { exampleWorkflowRunCompletedEvent } from './fixtures'
import { exampleRateLimitResponse } from './rateLimit/fixtures'
import { exampleCompletedCheckSuite } from './workflowRun/fixtures/completedCheckSuite'
import { examplePullRequestClosedEvent } from './fixtures'
import { WebhookPayload } from '@actions/github/lib/interfaces'
import { examplePullRequestOpenedEvent } from './fixtures'
import { exampleClosedPullRequestQuery } from './pullRequest/fixtures/closedPullRequest'

jest.mock('@actions/core')

jest.mock('@actions/github')
const octokitMock = {
  graphql: jest.fn(),
  rest: {
    rateLimit: {
      get: jest.fn(),
    },
  },
}
const getOctokit = github.getOctokit as jest.Mock
getOctokit.mockReturnValue(octokitMock)

jest.mock('@datadog/datadog-api-client')
const metricsApiMock = {
  submitMetrics: jest.fn<Promise<v1.IntakePayloadAccepted>, [v1.MetricsApiSubmitMetricsRequest]>(),
}
const metricsApiConstructor = v1.MetricsApi as jest.Mock
metricsApiConstructor.mockReturnValue(metricsApiMock)

test('workflow_run with collectJobMetrics', async () => {
  octokitMock.graphql.mockResolvedValue(exampleCompletedCheckSuite)
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  metricsApiMock.submitMetrics.mockResolvedValue({ status: 'ok' })

  await run(
    {
      eventName: 'workflow_run',
      payload: exampleWorkflowRunCompletedEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      githubToken: 'GITHUB_TOKEN',
      githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
      datadogApiKey: 'DATADOG_API_KEY',
      collectJobMetrics: true,
      collectStepMetrics: true,
      sendPullRequestLabels: false,
    }
  )
  expect(getOctokit).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toHaveBeenCalledTimes(4)
  expect(metricsApiMock.submitMetrics.mock.calls).toMatchSnapshot()
})

test('workflow_run', async () => {
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  metricsApiMock.submitMetrics.mockResolvedValue({ status: 'ok' })

  await run(
    {
      eventName: 'workflow_run',
      payload: exampleWorkflowRunCompletedEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      githubToken: 'GITHUB_TOKEN',
      githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
      datadogApiKey: 'DATADOG_API_KEY',
      collectJobMetrics: false,
      collectStepMetrics: false,
      sendPullRequestLabels: false,
    }
  )
  expect(getOctokit).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toHaveBeenCalledTimes(2)
  expect(metricsApiMock.submitMetrics.mock.calls).toMatchSnapshot()
})

test('pull_request_opened', async () => {
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  metricsApiMock.submitMetrics.mockResolvedValue({ status: 'ok' })

  await run(
    {
      eventName: 'pull_request',
      payload: examplePullRequestOpenedEvent as WebhookPayload,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      githubToken: 'GITHUB_TOKEN',
      githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
      datadogApiKey: 'DATADOG_API_KEY',
      collectJobMetrics: false,
      collectStepMetrics: false,
      sendPullRequestLabels: false,
    }
  )
  expect(getOctokit).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toHaveBeenCalledTimes(2)
  expect(metricsApiMock.submitMetrics.mock.calls).toMatchSnapshot()
})

test('pull_request_closed', async () => {
  octokitMock.graphql.mockResolvedValue(exampleClosedPullRequestQuery)
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  metricsApiMock.submitMetrics.mockResolvedValue({ status: 'ok' })

  await run(
    {
      eventName: 'pull_request',
      payload: examplePullRequestClosedEvent as WebhookPayload,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      githubToken: 'GITHUB_TOKEN',
      githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
      datadogApiKey: 'DATADOG_API_KEY',
      collectJobMetrics: false,
      collectStepMetrics: false,
      sendPullRequestLabels: true,
    }
  )
  expect(getOctokit).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toHaveBeenCalledTimes(2)
  expect(metricsApiMock.submitMetrics.mock.calls).toMatchSnapshot()
})
