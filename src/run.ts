import * as core from '@actions/core'
import * as github from '@actions/github'
import { PullRequestEvent, PushEvent, WorkflowRunEvent } from '@octokit/webhooks-types'
import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from './pullRequest/metrics'
import { computePushMetrics } from './push/metrics'
import { queryCompletedCheckSuite } from './queries/completedCheckSuite'
import { queryClosedPullRequest } from './queries/closedPullRequest'
import { computeRateLimitMetrics } from './rateLimit/metrics'
import { ActionInputs, GitHubContext } from './types'
import { computeWorkflowRunJobStepMetrics } from './workflowRun/metrics'
import { computeScheduleMetrics } from './schedule/metrics'
import { SubmitMetrics } from './client'
import { setupOtel } from './otel'
import { MeterProvider } from '@opentelemetry/sdk-metrics'
import { Meter } from '@opentelemetry/api'

export const run = async (context: GitHubContext, inputs: ActionInputs): Promise<void> => {
  // const submitMetrics = createMetricsClient(inputs)

  const meterProvider = setupOtel(inputs)

  core.info('Handling event')
  await handleEvent(meterProvider, context, inputs)
  // const rateLimit = await getRateLimitMetrics(context, inputs)
  // await submitMetrics(rateLimit, 'rate limit')

  core.info('Shutting down telemetry')
  await meterProvider.shutdown()
}

const handleEvent = async (meterProvider: MeterProvider, context: GitHubContext, inputs: ActionInputs) => {
  if (context.eventName === 'workflow_run') {
    return await handleWorkflowRun(meterProvider, context.payload as WorkflowRunEvent, inputs)
  }
  // if (context.eventName === 'pull_request') {
  //   return await handlePullRequest(submitMetrics, context.payload as PullRequestEvent, context, inputs)
  // }
  // if (context.eventName === 'push') {
  //   return handlePush(submitMetrics, context.payload as PushEvent)
  // }
  // if (context.eventName === 'schedule') {
  //   return handleSchedule(submitMetrics, context, inputs)
  // }
  core.warning(`Not supported event ${context.eventName}`)
}

const handleWorkflowRun = async (meterProvider: MeterProvider, e: WorkflowRunEvent, inputs: ActionInputs) => {
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

    const meter = meterProvider.getMeter('workflow-run')
    computeWorkflowRunJobStepMetrics(e, meter, checkSuite)

    // await submitMetrics(metrics.workflowRunMetrics, 'workflow run')
    // if (inputs.collectJobMetrics) {
    //   await submitMetrics(metrics.jobMetrics, 'job')
    // }
    // if (inputs.collectStepMetrics) {
    //   await submitMetrics(metrics.stepMetrics, 'step')
    // }
    return
  }

  core.warning(`Not supported action ${e.action}`)
}

const handlePullRequest = async (
  submitMetrics: SubmitMetrics,
  e: PullRequestEvent,
  context: GitHubContext,
  inputs: ActionInputs
) => {
  core.info(`Got pull request ${e.action} event: ${e.pull_request.html_url}`)

  if (e.action === 'opened') {
    return await submitMetrics(computePullRequestOpenedMetrics(e), 'pull request')
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
    return await submitMetrics(computePullRequestClosedMetrics(e, closedPullRequest, inputs), 'pull request')
  }

  core.warning(`Not supported action ${e.action}`)
}

const handlePush = async (submitMetrics: SubmitMetrics, e: PushEvent) => {
  core.info(`Got push event: ${e.compare}`)
  return await submitMetrics(computePushMetrics(e, new Date()), 'push')
}

const handleSchedule = async (submitMetrics: SubmitMetrics, context: GitHubContext, inputs: ActionInputs) => {
  core.info(`Got schedule event`)
  const octokit = github.getOctokit(inputs.githubToken)
  const queuedWorkflowRuns = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner: context.repo.owner,
    repo: context.repo.repo,
    status: 'queued',
    per_page: 100,
  })
  return await submitMetrics(computeScheduleMetrics(context, queuedWorkflowRuns, new Date()), 'schedule')
}

const getRateLimitMetrics = async (context: GitHubContext, inputs: ActionInputs) => {
  const octokit = github.getOctokit(inputs.githubTokenForRateLimitMetrics)
  const rateLimit = await octokit.rest.rateLimit.get()
  return computeRateLimitMetrics(context, rateLimit)
}
