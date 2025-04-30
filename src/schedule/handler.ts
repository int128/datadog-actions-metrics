import * as core from '@actions/core'
import * as github from '../github.js'
import { MetricsClient } from '../client.js'
import { computeScheduleMetrics } from './metrics.js'
import { Octokit } from '@octokit/action'

export const handleSchedule = async (metricsClient: MetricsClient, octokit: Octokit, context: github.Context) => {
  core.info(`Got schedule event`)
  const queuedWorkflowRuns = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner: context.repo.owner,
    repo: context.repo.repo,
    status: 'queued',
    per_page: 100,
  })
  return await metricsClient.submitMetrics(computeScheduleMetrics(context, queuedWorkflowRuns, new Date()), 'schedule')
}
