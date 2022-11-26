import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { run } from '../src/run'
import { exampleWorkflowRunEvent } from './workflowRun/fixtures/workflowRunEvent'
import { exampleRateLimitResponse } from './rateLimit/fixtures'
import { exampleCompletedCheckSuite } from './workflowRun/fixtures/completedCheckSuite'
import { examplePullRequestClosedEvent } from './pullRequest/fixtures/closed'
import { WebhookPayload } from '@actions/github/lib/interfaces'
import { examplePullRequestOpenedEvent } from './pullRequest/fixtures/opened'
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
      payload: exampleWorkflowRunEvent,
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
  expect(getOctokit).toBeCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toBeCalledTimes(1)
  expect(metricsApiMock.submitMetrics.mock.lastCall).toMatchSnapshot()
})

test('workflow_run', async () => {
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
      collectStepMetrics: false,
      sendPullRequestLabels: false,
    }
  )
  expect(getOctokit).toBeCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toBeCalledTimes(1)
  expect(metricsApiMock.submitMetrics.mock.lastCall).toMatchSnapshot()
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
  expect(getOctokit).toBeCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toBeCalledTimes(1)
  expect(metricsApiMock.submitMetrics.mock.lastCall).toMatchSnapshot()
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
  expect(getOctokit).toBeCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toBeCalledTimes(1)
  expect(metricsApiMock.submitMetrics.mock.lastCall).toMatchSnapshot()
})
