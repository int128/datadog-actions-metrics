import * as core from '@actions/core'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { PullRequestEvent, PushEvent, WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { computePullRequestMetrics } from './pullRequest/metrics'
import { computePushMetrics } from './push/metrics'
import { computeRateLimitMetrics } from './rateLimit/metrics'
import { GitHubContext } from './types'
import { getWorkflowRunMetrics, getWorkflowRunMetricsWithJobsSteps } from './workflowRun/get'

type Inputs = {
  githubToken: string
  githubTokenForRateLimitMetrics: string
  datadogApiKey?: string
  datadogSite?: string
  collectJobMetrics: boolean
}

export const run = async (context: GitHubContext, inputs: Inputs): Promise<void> => {
  if (context.eventName === 'workflow_run') {
    const e = context.payload as WorkflowRunCompletedEvent
    return await handleWorkflowRun(e, context, inputs)
  }
  if (context.eventName === 'pull_request') {
    const e = context.payload as PullRequestEvent
    return await handlePullRequest(e, context, inputs)
  }
  if (context.eventName === 'push') {
    const e = context.payload as PushEvent
    return await handlePush(e, context, inputs)
  }
  core.warning(`not supported event ${context.eventName}`)
}

const handleWorkflowRun = async (e: WorkflowRunCompletedEvent, context: GitHubContext, inputs: Inputs) => {
  core.info(`workflow run ${e.action} event: ${e.workflow_run.html_url}`)

  let series
  if (inputs.collectJobMetrics) {
    const octokit = github.getOctokit(inputs.githubToken)
    series = await getWorkflowRunMetricsWithJobsSteps(e, octokit)
  } else {
    series = getWorkflowRunMetrics(e)
  }

  series.push(...(await getRateLimitMetrics(context, inputs)))
  await submitMetrics(series, inputs)
}

const handlePullRequest = async (e: PullRequestEvent, context: GitHubContext, inputs: Inputs) => {
  core.info(`pull request ${e.action} event: ${e.pull_request.html_url}`)

  const series = computePullRequestMetrics(e)
  if (series === null) {
    core.warning(`not supported type ${e.action}`)
    return
  }

  series.push(...(await getRateLimitMetrics(context, inputs)))
  await submitMetrics(series, inputs)
}

const handlePush = async (e: PushEvent, context: GitHubContext, inputs: Inputs) => {
  core.info(`push event: ${e.compare}`)

  const series = computePushMetrics(e, new Date())

  series.push(...(await getRateLimitMetrics(context, inputs)))
  await submitMetrics(series, inputs)
}

const getRateLimitMetrics = async (context: GitHubContext, inputs: Inputs) => {
  const octokit = github.getOctokit(inputs.githubTokenForRateLimitMetrics)
  const rateLimit = await octokit.rest.rateLimit.get()
  return computeRateLimitMetrics(context, rateLimit)
}

const submitMetrics = async (series: Series[], inputs: Inputs) => {
  const dryRun = inputs.datadogApiKey === undefined
  core.startGroup(`Send metrics to Datadog ${dryRun ? '(dry-run)' : ''}`)
  core.info(JSON.stringify(series, undefined, 2))
  if (!dryRun) {
    const configuration = v1.createConfiguration({
      authMethods: { apiKeyAuth: inputs.datadogApiKey },
    })

    if (inputs.datadogSite) {
      v1.setServerVariables(configuration, {
        site: inputs.datadogSite,
      })
    }

    const metrics = new v1.MetricsApi(configuration)
    const accepted = await metrics.submitMetrics({ body: { series } })
    core.info(`sent as ${JSON.stringify(accepted)}`)
  }
  core.endGroup()
}
