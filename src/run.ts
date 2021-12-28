import * as core from '@actions/core'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { PullRequestEvent, PushEvent, WorkflowRunEvent } from '@octokit/webhooks-types'
import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from './pullRequest/metrics'
import { computePushMetrics } from './push/metrics'
import { queryCompletedCheckSuite } from './queries/completedCheckSuite'
import { queryClosedPullRequest } from './queries/closedPullRequest'
import { computeRateLimitMetrics } from './rateLimit/metrics'
import { GitHubContext } from './types'
import { computeWorkflowRunJobStepMetrics } from './workflowRun/metrics'

type Inputs = {
  githubToken: string
  githubTokenForRateLimitMetrics: string
  datadogApiKey?: string
  datadogSite?: string
  collectJobMetrics: boolean
}

export const run = async (context: GitHubContext, inputs: Inputs): Promise<void> => {
  const series = await handleEvent(context, inputs)
  if (series === undefined) {
    core.warning(`Not supported event ${context.eventName} action ${String(context.payload.action)}`)
    return
  }

  const rateLimit = await getRateLimitMetrics(context, inputs)
  series.push(...rateLimit)
  await submitMetrics(series, inputs)
}

const handleEvent = async (context: GitHubContext, inputs: Inputs) => {
  if (context.eventName === 'workflow_run') {
    const e = context.payload as WorkflowRunEvent
    return await handleWorkflowRun(e, inputs)
  }

  if (context.eventName === 'pull_request') {
    const e = context.payload as PullRequestEvent
    return await handlePullRequest(e, context, inputs)
  }

  if (context.eventName === 'push') {
    const e = context.payload as PushEvent
    return handlePush(e)
  }
}

const handleWorkflowRun = async (e: WorkflowRunEvent, inputs: Inputs) => {
  core.info(`Got workflow run ${e.action} event: ${e.workflow_run.html_url}`)

  if (e.action === 'completed') {
    if (!inputs.collectJobMetrics) {
      return computeWorkflowRunJobStepMetrics(e)
    }

    const octokit = github.getOctokit(inputs.githubToken)
    const checkSuite = await queryCompletedCheckSuite(octokit, {
      node_id: e.workflow_run.check_suite_node_id,
      workflow_path: e.workflow.path,
    })
    return computeWorkflowRunJobStepMetrics(e, checkSuite)
  }
}

const handlePullRequest = async (e: PullRequestEvent, context: GitHubContext, inputs: Inputs) => {
  core.info(`Got pull request ${e.action} event: ${e.pull_request.html_url}`)

  if (e.action === 'opened') {
    return computePullRequestOpenedMetrics(e)
  }

  if (e.action === 'closed') {
    const octokit = github.getOctokit(inputs.githubToken)
    let closedPullRequest
    try {
      closedPullRequest = await queryClosedPullRequest(octokit, {
        owner: context.repo.owner,
        name: context.repo.repo,
        number: e.pull_request.number,
      })
    } catch (error) {
      core.warning(`Could not get the pull request: ${String(error)}`)
    }
    return computePullRequestClosedMetrics(e, closedPullRequest)
  }
}

const handlePush = (e: PushEvent) => {
  core.info(`Got push event: ${e.compare}`)
  return computePushMetrics(e, new Date())
}

const getRateLimitMetrics = async (context: GitHubContext, inputs: Inputs) => {
  const octokit = github.getOctokit(inputs.githubTokenForRateLimitMetrics)
  const rateLimit = await octokit.rest.rateLimit.get()
  return computeRateLimitMetrics(context, rateLimit)
}

const submitMetrics = async (series: Series[], inputs: Inputs) => {
  core.startGroup('Metrics payload')
  core.info(JSON.stringify(series, undefined, 2))
  core.endGroup()

  const dryRun = inputs.datadogApiKey === undefined
  if (dryRun) {
    return
  }

  const configuration = v1.createConfiguration({
    authMethods: {
      apiKeyAuth: inputs.datadogApiKey,
    },
  })
  if (inputs.datadogSite) {
    v1.setServerVariables(configuration, {
      site: inputs.datadogSite,
    })
  }
  const metrics = new v1.MetricsApi(configuration)

  core.info(`Sending ${series.length} metrics to Datadog`)
  const accepted = await metrics.submitMetrics({ body: { series } })
  core.info(`Sent as ${JSON.stringify(accepted)}`)
}
