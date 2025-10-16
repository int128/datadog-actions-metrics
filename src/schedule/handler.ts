import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type { MetricsClient } from '../client.js'
import type * as github from '../github.js'
import { computeScheduleMetrics } from './metrics.js'

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
