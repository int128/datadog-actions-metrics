import * as core from '@actions/core'
import * as github from '@actions/github'
import { PullRequestEvent, PushEvent, WorkflowRunEvent } from '@octokit/webhooks-types'
import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from './pullRequest/metrics'
import { computePushMetrics } from './push/metrics'
import { getCompletedCheckSuite } from './queries/getCheckSuite'
import { getPullRequestFirstCommit } from './queries/getPullRequest'
import { computeRateLimitMetrics } from './rateLimit/metrics'
import { GitHubContext } from './types'
import { computeWorkflowRunJobStepMetrics } from './workflowRun/metrics'
import { computeScheduleMetrics } from './schedule/metrics'
import { SubmitMetrics, createMetricsClient } from './client'

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
  const submitMetrics = createMetricsClient(inputs)
  await handleEvent(submitMetrics, context, inputs)
  const rateLimit = await getRateLimitMetrics(context, inputs)
  await submitMetrics(rateLimit, 'rate limit')
}

const handleEvent = async (submitMetrics: SubmitMetrics, context: GitHubContext, inputs: Inputs) => {
  if (context.eventName === 'workflow_run') {
    return await handleWorkflowRun(submitMetrics, context.payload as WorkflowRunEvent, inputs)
  }
  if (context.eventName === 'pull_request') {
    return await handlePullRequest(submitMetrics, context.payload as PullRequestEvent, context, inputs)
  }
  if (context.eventName === 'push') {
    return handlePush(submitMetrics, context.payload as PushEvent)
  }
  if (context.eventName === 'schedule') {
    return handleSchedule(submitMetrics, context, inputs)
  }
  core.warning(`Not supported event ${context.eventName}`)
}

const handleWorkflowRun = async (submitMetrics: SubmitMetrics, e: WorkflowRunEvent, inputs: Inputs) => {
  core.info(`Got workflow run ${e.action} event: ${e.workflow_run.html_url}`)

  if (e.action === 'completed') {
    let checkSuite, workflowJobs
    if (inputs.collectJobMetrics || inputs.collectStepMetrics) {
      core.info(`Finding the check suite ${e.workflow_run.check_suite_node_id}`)
      const octokit = github.getOctokit(inputs.githubToken)
      try {
        checkSuite = await getCompletedCheckSuite(octokit, { node_id: e.workflow_run.check_suite_node_id })
      } catch (error) {
        core.warning(`Could not get the check suite: ${String(error)}`)
      }
      try {
        workflowJobs = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
          owner: e.workflow_run.repository.owner.login,
          repo: e.workflow_run.repository.name,
          run_id: e.workflow_run.id,
          attempt_number: e.workflow_run.run_attempt,
          per_page: 100,
        })
      } catch (error) {
        core.warning(`Could not get the jobs: ${String(error)}`)
      }
    }
    if (checkSuite) {
      core.info(`Found the check suite with ${checkSuite.node.checkRuns.nodes.length} check run(s)`)
    }

    const metrics = computeWorkflowRunJobStepMetrics(e, checkSuite, workflowJobs?.data)
    await submitMetrics(metrics.workflowRunMetrics, 'workflow run')
    if (inputs.collectJobMetrics) {
      await submitMetrics(metrics.jobMetrics, 'job')
    }
    if (inputs.collectStepMetrics) {
      await submitMetrics(metrics.stepMetrics, 'step')
    }
    return
  }

  core.warning(`Not supported action ${e.action}`)
}

const handlePullRequest = async (
  submitMetrics: SubmitMetrics,
  e: PullRequestEvent,
  context: GitHubContext,
  inputs: Inputs,
) => {
  core.info(`Got pull request ${e.action} event: ${e.pull_request.html_url}`)

  if (e.action === 'opened') {
    return await submitMetrics(computePullRequestOpenedMetrics(e), 'pull request')
  }

  if (e.action === 'closed') {
    core.info(`Finding the first commit of the pull request #${e.pull_request.number}`)
    const octokit = github.getOctokit(inputs.githubToken)
    let pullRequestFirstCommit
    try {
      pullRequestFirstCommit = await getPullRequestFirstCommit(octokit, {
        owner: context.repo.owner,
        name: context.repo.repo,
        number: e.pull_request.number,
      })
    } catch (error) {
      core.warning(`Could not get the pull request: ${String(error)}`)
    }
    return await submitMetrics(computePullRequestClosedMetrics(e, pullRequestFirstCommit, inputs), 'pull request')
  }

  core.warning(`Not supported action ${e.action}`)
}

const handlePush = async (submitMetrics: SubmitMetrics, e: PushEvent) => {
  core.info(`Got push event: ${e.compare}`)
  return await submitMetrics(computePushMetrics(e, new Date()), 'push')
}

const handleSchedule = async (submitMetrics: SubmitMetrics, context: GitHubContext, inputs: Inputs) => {
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

const getRateLimitMetrics = async (context: GitHubContext, inputs: Inputs) => {
  const octokit = github.getOctokit(inputs.githubTokenForRateLimitMetrics)
  const rateLimit = await octokit.rest.rateLimit.get()
  return computeRateLimitMetrics(context, rateLimit)
}
