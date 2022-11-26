import * as core from '@actions/core'
import * as github from '@actions/github'
import { client, v1 } from '@datadog/datadog-api-client'
import { PullRequestEvent, PushEvent, WorkflowRunEvent } from '@octokit/webhooks-types'
import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from './pullRequest/metrics'
import { computePushMetrics } from './push/metrics'
import { queryCompletedCheckSuite } from './queries/completedCheckSuite'
import { queryClosedPullRequest } from './queries/closedPullRequest'
import { computeRateLimitMetrics } from './rateLimit/metrics'
import { GitHubContext } from './types'
import { computeWorkflowRunJobStepMetrics } from './workflowRun/metrics'
import { computeScheduleMetrics } from './schedule/metrics'

type Inputs = {
  githubToken: string
  githubTokenForRateLimitMetrics: string
  datadogApiKey?: string
  datadogSite?: string
  collectJobMetrics: boolean
  collectStepMetrics: boolean
  sendPullRequestLabels: boolean
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
    return await handleWorkflowRun(context.payload as WorkflowRunEvent, inputs)
  }
  if (context.eventName === 'pull_request') {
    return await handlePullRequest(context.payload as PullRequestEvent, context, inputs)
  }
  if (context.eventName === 'push') {
    return handlePush(context.payload as PushEvent)
  }
  if (context.eventName === 'schedule') {
    return handleSchedule(context, inputs)
  }
}

const handleWorkflowRun = async (e: WorkflowRunEvent, inputs: Inputs) => {
  core.info(`Got workflow run ${e.action} event: ${e.workflow_run.html_url}`)

  if (e.action === 'completed') {
    let checkSuite
    if (inputs.collectJobMetrics || inputs.collectStepMetrics) {
      const octokit = github.getOctokit(inputs.githubToken)
      try {
        checkSuite = await queryCompletedCheckSuite(octokit, {
          node_id: e.workflow_run.check_suite_node_id,
          workflow_path: e.workflow.path,
        })
      } catch (error) {
        core.warning(`Could not get the check suite: ${String(error)}`)
      }
    }
    if (checkSuite) {
      core.info(`Found check suite with ${checkSuite.node.checkRuns.nodes.length} check run(s)`)
    }

    const metrics = computeWorkflowRunJobStepMetrics(e, checkSuite)
    const series = [...metrics.workflowRunMetrics]
    if (inputs.collectJobMetrics) {
      series.push(...metrics.jobMetrics)
    }
    if (inputs.collectStepMetrics) {
      series.push(...metrics.stepMetrics)
    }
    return series
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
    return computePullRequestClosedMetrics(e, closedPullRequest, inputs)
  }
}

const handlePush = (e: PushEvent) => {
  core.info(`Got push event: ${e.compare}`)
  return computePushMetrics(e, new Date())
}

const handleSchedule = async (context: GitHubContext, inputs: Inputs) => {
  core.info(`Got schedule event`)
  const octokit = github.getOctokit(inputs.githubToken)
  const queuedWorkflowRuns = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner: context.repo.owner,
    repo: context.repo.repo,
    status: 'queued',
    per_page: 100,
  })
  return computeScheduleMetrics(context, queuedWorkflowRuns, new Date())
}

const getRateLimitMetrics = async (context: GitHubContext, inputs: Inputs) => {
  const octokit = github.getOctokit(inputs.githubTokenForRateLimitMetrics)
  const rateLimit = await octokit.rest.rateLimit.get()
  return computeRateLimitMetrics(context, rateLimit)
}

const submitMetrics = async (series: v1.Series[], inputs: Inputs) => {
  core.startGroup('Metrics payload')
  core.info(JSON.stringify(series, undefined, 2))
  core.endGroup()

  const dryRun = inputs.datadogApiKey === undefined
  if (dryRun) {
    return
  }

  const configuration = client.createConfiguration({
    authMethods: {
      apiKeyAuth: inputs.datadogApiKey,
    },
    httpConfig: {
      compress: true,
    },
  })
  if (inputs.datadogSite) {
    client.setServerVariables(configuration, {
      site: inputs.datadogSite,
    })
  }
  const metrics = new v1.MetricsApi(configuration)

  core.info(`Sending ${series.length} metrics to Datadog`)
  const accepted = await metrics.submitMetrics({ body: { series } })
  core.info(`Sent as ${JSON.stringify(accepted)}`)
}
