import * as core from '@actions/core'
import * as github from '@actions/github'
import { PullRequestEvent, PushEvent, WorkflowRunEvent } from '@octokit/webhooks-types'
import { computeRateLimitMetrics } from './rateLimit/metrics'
import { GitHubContext } from './types'
import { MetricsClient, createMetricsClient } from './client'
import { handleWorkflowRun } from './workflowRun/handler'
import { handlePullRequest } from './pullRequest/handler'
import { handlePush } from './push/handler'
import { handleSchedule } from './schedule/handler'

type Inputs = {
  githubToken: string
  githubTokenForRateLimitMetrics: string
  datadogApiKey?: string
  datadogSite?: string
  datadogTags: string[]
  collectJobMetrics: boolean
  collectStepMetrics: boolean
  preferDistributionWorkflowRunMetrics: boolean
  preferDistributionJobMetrics: boolean
  preferDistributionStepMetrics: boolean
  sendPullRequestLabels: boolean
}

export const run = async (context: GitHubContext, inputs: Inputs): Promise<void> => {
  const metricsClient = createMetricsClient(inputs)

  await handleEvent(metricsClient, context, inputs)

  const rateLimit = await getRateLimitMetrics(context, inputs)
  await metricsClient.submitMetrics(rateLimit, 'rate limit')
}

const handleEvent = async (metricsClient: MetricsClient, context: GitHubContext, inputs: Inputs) => {
  if (context.eventName === 'workflow_run') {
    return await handleWorkflowRun(metricsClient, context.payload as WorkflowRunEvent, inputs)
  }
  if (context.eventName === 'pull_request') {
    return await handlePullRequest(metricsClient, context.payload as PullRequestEvent, context, inputs)
  }
  if (context.eventName === 'push') {
    return handlePush(metricsClient, context.payload as PushEvent)
  }
  if (context.eventName === 'schedule') {
    return handleSchedule(metricsClient, context, inputs)
  }
  core.warning(`Not supported event ${context.eventName}`)
}

const getRateLimitMetrics = async (context: GitHubContext, inputs: Inputs) => {
  const octokit = github.getOctokit(inputs.githubTokenForRateLimitMetrics)
  const rateLimit = await octokit.rest.rateLimit.get()
  return computeRateLimitMetrics(context, rateLimit)
}
