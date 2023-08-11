import * as github from '@actions/github'
import * as core from '@actions/core'

import { v1 } from '@datadog/datadog-api-client'
import mockConsole from 'jest-mock-console'

import { run } from '../src/run'
import { exampleWorkflowRunCompletedEvent } from './fixtures'
import { exampleRateLimitResponse } from './rateLimit/fixtures'
import { exampleCompletedCheckSuite } from './workflowRun/fixtures/completedCheckSuite'
import { examplePullRequestClosedEvent } from './fixtures'
import { WebhookPayload } from '@actions/github/lib/interfaces'
import { examplePullRequestOpenedEvent } from './fixtures'
import { exampleClosedPullRequestQuery } from './pullRequest/fixtures/closedPullRequest'
import { ActionsConsoleMetricExporter } from '../src/otel/actionsExporter'

// jest.mock('@actions/core')

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

beforeAll(() => {
  // this ensures timestamps in snapshots remain static
  jest.useFakeTimers({ now: new Date('2023-08-11T00:00:00') })
})

afterAll(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
})

test('workflow_run with collectJobMetrics', async () => {
  octokitMock.graphql.mockResolvedValue(exampleCompletedCheckSuite)
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)

  const exporterSpy = jest.spyOn(ActionsConsoleMetricExporter.prototype, 'export')

  await run(
    {
      eventName: 'workflow_run',
      payload: exampleWorkflowRunCompletedEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      githubToken: 'GITHUB_TOKEN',
      githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
      collectJobMetrics: true,
      collectStepMetrics: true,
      sendPullRequestLabels: false,
      useConsoleExporter: true,
    }
  )
  expect(getOctokit).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(exporterSpy.mock.calls).toMatchSnapshot()
})

test('workflow_run', async () => {
  const exporterSpy = jest.spyOn(ActionsConsoleMetricExporter.prototype, 'export')

  await run(
    {
      eventName: 'workflow_run',
      payload: exampleWorkflowRunCompletedEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      githubToken: 'GITHUB_TOKEN',
      githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
      collectJobMetrics: false,
      collectStepMetrics: false,
      sendPullRequestLabels: false,
      useConsoleExporter: true,
    }
  )

  expect(exporterSpy.mock.calls).toMatchSnapshot()
})

// test('pull_request_opened', async () => {
//   octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
//   submitMetrics.mockResolvedValue({ status: 'ok' })

//   await run(
//     {
//       eventName: 'pull_request',
//       payload: examplePullRequestOpenedEvent as WebhookPayload,
//       repo: { owner: 'Codertocat', repo: 'Hello-World' },
//     },
//     {
//       githubToken: 'GITHUB_TOKEN',
//       githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
//       // datadogApiKey: 'DATADOG_API_KEY',
//       collectJobMetrics: false,
//       collectStepMetrics: false,
//       sendPullRequestLabels: false,
//     }
//   )
//   expect(getOctokit).toHaveBeenCalledWith('GITHUB_TOKEN')
//   // expect(submitMetrics).toHaveBeenCalledTimes(2)
//   // expect(submitMetrics.mock.calls).toMatchSnapshot()
// })

// test('pull_request_closed', async () => {
//   octokitMock.graphql.mockResolvedValue(exampleClosedPullRequestQuery)
//   octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
//   // submitMetrics.mockResolvedValue({ status: 'ok' })

//   await run(
//     {
//       eventName: 'pull_request',
//       payload: examplePullRequestClosedEvent as WebhookPayload,
//       repo: { owner: 'Codertocat', repo: 'Hello-World' },
//     },
//     {
//       githubToken: 'GITHUB_TOKEN',
//       githubTokenForRateLimitMetrics: 'GITHUB_TOKEN',
//       collectJobMetrics: false,
//       collectStepMetrics: false,
//       sendPullRequestLabels: true,
//     }
//   )
//   expect(getOctokit).toHaveBeenCalledWith('GITHUB_TOKEN')
//   // expect(submitMetrics).toHaveBeenCalledTimes(2)
//   // expect(submitMetrics.mock.calls).toMatchSnapshot()
// })
