import * as core from '@actions/core'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { computeRateLimitMetrics } from './rateLimit/metrics'
import { GitHubContext } from './types'
import { getWorkflowRunMetrics, getWorkflowRunMetricsWithJobsSteps } from './workflowRun/get'

type Inputs = {
  githubToken: string
  githubTokenForRateLimitMetrics: string
  datadogApiKey?: string
  collectJobMetrics: boolean
}

export const run = async (context: GitHubContext, inputs: Inputs): Promise<void> => {
  if (context.eventName === 'workflow_run') {
    const e = context.payload as WorkflowRunCompletedEvent
    core.info(`workflow run event: ${e.workflow_run.html_url}`)
    return await handleWorkflowRun(e, context, inputs)
  }

  core.warning(`unknown event ${context.eventName}`)
}

const handleWorkflowRun = async (
  e: WorkflowRunCompletedEvent,
  context: GitHubContext,
  inputs: Inputs
): Promise<void> => {
  let series
  if (inputs.collectJobMetrics) {
    const octokit = github.getOctokit(inputs.githubToken)
    series = await getWorkflowRunMetricsWithJobsSteps(e, octokit)
  } else {
    series = getWorkflowRunMetrics(e)
  }

  series.push(...(await getRateLimitMetrics(context, inputs)))

  const dryRun = inputs.datadogApiKey === undefined
  core.startGroup(`Send metrics to Datadog ${dryRun ? '(dry-run)' : ''}`)
  core.info(JSON.stringify(series, undefined, 2))
  if (!dryRun) {
    const metrics = new v1.MetricsApi(v1.createConfiguration({ authMethods: { apiKeyAuth: inputs.datadogApiKey } }))
    const accepted = await metrics.submitMetrics({ body: { series } })
    core.info(`sent as ${JSON.stringify(accepted)}`)
  }
  core.endGroup()
}

const getRateLimitMetrics = async (context: GitHubContext, inputs: Inputs): Promise<Series[]> => {
  const octokit = github.getOctokit(inputs.githubTokenForRateLimitMetrics)
  const rateLimit = await octokit.rest.rateLimit.get()
  return computeRateLimitMetrics(context, rateLimit)
}
