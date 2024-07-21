import * as core from '@actions/core'
import * as github from '@actions/github'
import { MetricsClient } from '../client.js'
import { GitHubContext } from '../types.js'
import { computeScheduleMetrics } from './metrics.js'

type Inputs = {
  githubToken: string
}

export const handleSchedule = async (metricsClient: MetricsClient, context: GitHubContext, inputs: Inputs) => {
  core.info(`Got schedule event`)
  const octokit = github.getOctokit(inputs.githubToken)
  const queuedWorkflowRuns = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner: context.repo.owner,
    repo: context.repo.repo,
    status: 'queued',
    per_page: 100,
  })
  return await metricsClient.submitMetrics(computeScheduleMetrics(context, queuedWorkflowRuns, new Date()), 'schedule')
}
