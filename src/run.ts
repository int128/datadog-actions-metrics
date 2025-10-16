import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type { PullRequestEvent, PushEvent, WorkflowRunEvent } from '@octokit/webhooks-types'
import type { MetricsClient } from './client.js'
import type * as github from './github.js'
import { handlePullRequest } from './pullRequest/handler.js'
import { handlePush } from './push/handler.js'
import { computeRateLimitMetrics } from './rateLimit/metrics.js'
import { handleSchedule } from './schedule/handler.js'
import { handleWorkflowRun } from './workflowRun/handler.js'

type Inputs = {
  collectJobMetrics: boolean
  collectStepMetrics: boolean
  preferDistributionWorkflowRunMetrics: boolean
  preferDistributionJobMetrics: boolean
  preferDistributionStepMetrics: boolean
  sendPullRequestLabels: boolean
}

export const run = async (
  metricsClient: MetricsClient,
  octokit: Octokit,
  octokitForRateLimitMetrics: Octokit,
  context: github.Context,
  inputs: Inputs,
): Promise<void> => {
  await handleEvent(metricsClient, octokit, context, inputs)

  const rateLimit = await getRateLimitMetrics(octokitForRateLimitMetrics, context).catch((e) => {
    core.warning(`Rate-limit metrics are not available: ${e}`)
  })
  if (rateLimit) {
    await metricsClient.submitMetrics(rateLimit, 'rate-limit')
  }
}

const handleEvent = async (metricsClient: MetricsClient, octokit: Octokit, context: github.Context, inputs: Inputs) => {
  if (context.eventName === 'workflow_run') {
    return await handleWorkflowRun(metricsClient, octokit, context.payload as WorkflowRunEvent, inputs)
  }
  if (context.eventName === 'pull_request') {
    return await handlePullRequest(metricsClient, octokit, context.payload as PullRequestEvent, context, inputs)
  }
  if (context.eventName === 'push') {
    return handlePush(metricsClient, context.payload as PushEvent)
  }
  if (context.eventName === 'schedule') {
    return handleSchedule(metricsClient, octokit, context)
  }
  core.warning(`Not supported event ${context.eventName}`)
}

const getRateLimitMetrics = async (octokit: Octokit, context: github.Context) => {
  const rateLimit = await octokit.rest.rateLimit.get()
  return computeRateLimitMetrics(context, rateLimit)
}
