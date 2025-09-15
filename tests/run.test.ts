import { test, expect, vi } from 'vitest'
import { run } from '../src/run.js'
import { exampleWorkflowRunCompletedEvent } from './fixtures.js'
import { exampleRateLimitResponse } from './rateLimit/fixtures/index.js'
import { exampleCompletedCheckSuite } from './workflowRun/fixtures/completedCheckSuite.js'
import { examplePullRequestClosedEvent } from './fixtures.js'
import { examplePullRequestOpenedEvent } from './fixtures.js'
import { exampleGetPullRequestQuery } from './pullRequest/fixtures/getPullRequest.js'
import { exampleWorkflowJobs } from './workflowRun/fixtures/workflowJobs.js'
import { Octokit } from '@octokit/action'

vi.mock('@actions/core')

const metricsClient = {
  submitMetrics: vi.fn().mockResolvedValue({ status: 'ok' }),
  submitDistributionPoints: vi.fn().mockResolvedValue({ status: 'ok' }),
}

test('workflow_run with collectJobMetrics', async () => {
  const octokitMock = {
    paginate: vi.fn(),
    graphql: vi.fn().mockResolvedValue(exampleCompletedCheckSuite),
    rest: {
      actions: {
        listJobsForWorkflowRunAttempt: vi.fn(),
      },
      rateLimit: {
        get: vi.fn().mockResolvedValue(exampleRateLimitResponse),
      },
    },
  }
  octokitMock.paginate.mockImplementation((f: unknown) => {
    expect(f).toBe(octokitMock.rest.actions.listJobsForWorkflowRunAttempt)
    return exampleWorkflowJobs
  })

  await run(
    metricsClient,
    octokitMock as unknown as Octokit,
    octokitMock as unknown as Octokit,
    {
      eventName: 'workflow_run',
      payload: exampleWorkflowRunCompletedEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      collectJobMetrics: true,
      collectStepMetrics: true,
      preferDistributionWorkflowRunMetrics: false,
      preferDistributionJobMetrics: false,
      preferDistributionStepMetrics: false,
      sendPullRequestLabels: false,
      collectJobMetricsRealtime: false,
    },
  )
  expect(metricsClient.submitMetrics).toHaveBeenCalledTimes(4)
  expect(metricsClient.submitMetrics.mock.calls).toMatchSnapshot()
})

test('workflow_run', async () => {
  const octokitMock = {
    rest: {
      rateLimit: {
        get: vi.fn().mockResolvedValue(exampleRateLimitResponse),
      },
    },
  }

  await run(
    metricsClient,
    octokitMock as unknown as Octokit,
    octokitMock as unknown as Octokit,
    {
      eventName: 'workflow_run',
      payload: exampleWorkflowRunCompletedEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      collectJobMetrics: false,
      collectStepMetrics: false,
      preferDistributionWorkflowRunMetrics: false,
      preferDistributionJobMetrics: false,
      preferDistributionStepMetrics: false,
      sendPullRequestLabels: false,
      collectJobMetricsRealtime: false,
    },
  )
  expect(metricsClient.submitMetrics).toHaveBeenCalledTimes(2)
  expect(metricsClient.submitMetrics.mock.calls).toMatchSnapshot()
})

test('pull_request_opened', async () => {
  const octokitMock = {
    rest: {
      rateLimit: {
        get: vi.fn().mockResolvedValue(exampleRateLimitResponse),
      },
    },
  }

  await run(
    metricsClient,
    octokitMock as unknown as Octokit,
    octokitMock as unknown as Octokit,
    {
      eventName: 'pull_request',
      payload: examplePullRequestOpenedEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      collectJobMetrics: false,
      collectStepMetrics: false,
      preferDistributionWorkflowRunMetrics: false,
      preferDistributionJobMetrics: false,
      preferDistributionStepMetrics: false,
      sendPullRequestLabels: false,
      collectJobMetricsRealtime: false,
    },
  )
  expect(metricsClient.submitMetrics).toHaveBeenCalledTimes(2)
  expect(metricsClient.submitMetrics.mock.calls).toMatchSnapshot()
})

test('pull_request_closed', async () => {
  const octokitMock = {
    graphql: vi.fn().mockResolvedValue(exampleGetPullRequestQuery),
    rest: {
      rateLimit: {
        get: vi.fn().mockResolvedValue(exampleRateLimitResponse),
      },
    },
  }

  await run(
    metricsClient,
    octokitMock as unknown as Octokit,
    octokitMock as unknown as Octokit,
    {
      eventName: 'pull_request',
      payload: examplePullRequestClosedEvent,
      repo: { owner: 'Codertocat', repo: 'Hello-World' },
    },
    {
      collectJobMetrics: false,
      collectStepMetrics: false,
      preferDistributionWorkflowRunMetrics: false,
      preferDistributionJobMetrics: false,
      preferDistributionStepMetrics: false,
      sendPullRequestLabels: true,
      collectJobMetricsRealtime: false,
    },
  )
  expect(metricsClient.submitMetrics).toHaveBeenCalledTimes(2)
  expect(metricsClient.submitMetrics.mock.calls).toMatchSnapshot()
})
