import { test, expect, vi } from 'vitest'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { run } from '../src/run.js'
import { exampleWorkflowRunCompletedEvent } from './fixtures.js'
import { exampleRateLimitResponse } from './rateLimit/fixtures/index.js'
import { exampleCompletedCheckSuite } from './workflowRun/fixtures/completedCheckSuite.js'
import { examplePullRequestClosedEvent } from './fixtures.js'
import { WebhookPayload } from '@actions/github/lib/interfaces.js'
import { examplePullRequestOpenedEvent } from './fixtures.js'
import { exampleGetPullRequestQuery } from './pullRequest/fixtures/getPullRequest.js'
import { exampleWorkflowJobs } from './workflowRun/fixtures/workflowJobs.js'

vi.mock('@actions/core')

vi.mock('@actions/github')
const octokitMock = {
  paginate: vi.fn(),
  graphql: vi.fn(),
  rest: {
    actions: {
      listJobsForWorkflowRunAttempt: vi.fn(),
    },
    rateLimit: {
      get: vi.fn(),
    },
  },
}
vi.mocked(github.getOctokit).mockReturnValue(octokitMock as unknown as ReturnType<typeof github.getOctokit>)

vi.mock('@datadog/datadog-api-client')
const submitMetrics = vi.spyOn(v1.MetricsApi.prototype, 'submitMetrics')

test('workflow_run with collectJobMetrics', async () => {
  octokitMock.paginate.mockImplementation((f: unknown) => {
    expect(f).toBe(octokitMock.rest.actions.listJobsForWorkflowRunAttempt)
    return exampleWorkflowJobs
  })
  octokitMock.graphql.mockResolvedValue(exampleCompletedCheckSuite)
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  submitMetrics.mockResolvedValue({ status: 'ok' })

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
      datadogTags: [],
      metricsPatterns: [],
      collectJobMetrics: true,
      collectStepMetrics: true,
      preferDistributionWorkflowRunMetrics: false,
      preferDistributionJobMetrics: false,
      preferDistributionStepMetrics: false,
      sendPullRequestLabels: false,
    },
  )
  expect(vi.mocked(github.getOctokit)).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(submitMetrics).toHaveBeenCalledTimes(4)
  expect(submitMetrics.mock.calls).toMatchSnapshot()
})

test('workflow_run', async () => {
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  submitMetrics.mockResolvedValue({ status: 'ok' })

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
      datadogTags: [],
      metricsPatterns: [],
      collectJobMetrics: false,
      collectStepMetrics: false,
      preferDistributionWorkflowRunMetrics: false,
      preferDistributionJobMetrics: false,
      preferDistributionStepMetrics: false,
      sendPullRequestLabels: false,
    },
  )
  expect(vi.mocked(github.getOctokit)).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(submitMetrics).toHaveBeenCalledTimes(2)
  expect(submitMetrics.mock.calls).toMatchSnapshot()
})

test('pull_request_opened', async () => {
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  submitMetrics.mockResolvedValue({ status: 'ok' })

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
      datadogTags: [],
      metricsPatterns: [],
      collectJobMetrics: false,
      collectStepMetrics: false,
      preferDistributionWorkflowRunMetrics: false,
      preferDistributionJobMetrics: false,
      preferDistributionStepMetrics: false,
      sendPullRequestLabels: false,
    },
  )
  expect(vi.mocked(github.getOctokit)).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(submitMetrics).toHaveBeenCalledTimes(2)
  expect(submitMetrics.mock.calls).toMatchSnapshot()
})

test('pull_request_closed', async () => {
  octokitMock.graphql.mockResolvedValue(exampleGetPullRequestQuery)
  octokitMock.rest.rateLimit.get.mockResolvedValue(exampleRateLimitResponse)
  submitMetrics.mockResolvedValue({ status: 'ok' })

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
      datadogTags: [],
      metricsPatterns: [],
      collectJobMetrics: false,
      collectStepMetrics: false,
      preferDistributionWorkflowRunMetrics: false,
      preferDistributionJobMetrics: false,
      preferDistributionStepMetrics: false,
      sendPullRequestLabels: true,
    },
  )
  expect(vi.mocked(github.getOctokit)).toHaveBeenCalledWith('GITHUB_TOKEN')
  expect(submitMetrics).toHaveBeenCalledTimes(2)
  expect(submitMetrics.mock.calls).toMatchSnapshot()
})
