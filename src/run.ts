import * as core from '@actions/core'
import * as github from './github.js'
import { Octokit } from '@octokit/action'
import { MetricsClient } from './client.js'
import { PullRequestEvent, PushEvent, WorkflowRunEvent } from '@octokit/webhooks-types'
import { computeRateLimitMetrics } from './rateLimit/metrics.js'
import { handleWorkflowRun } from './workflowRun/handler.js'
import { handlePullRequest } from './pullRequest/handler.js'
import { handlePush } from './push/handler.js'
import { handleSchedule } from './schedule/handler.js'
import { handleWorkflowJob } from './workflowJob/handler.js'
import { WorkflowJobEvent } from '@octokit/webhooks-types'

type Inputs = {
  collectJobMetrics: boolean
  collectStepMetrics: boolean
  preferDistributionWorkflowRunMetrics: boolean
  preferDistributionJobMetrics: boolean
  preferDistributionStepMetrics: boolean
  sendPullRequestLabels: boolean
  collectJobMetricsRealtime: boolean
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
  if (context.eventName === 'workflow_job') {
    return await handleWorkflowJob(metricsClient, octokit, context.payload as unknown as WorkflowJobEvent, inputs)
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
