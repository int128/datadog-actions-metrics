import * as core from '@actions/core'
import * as github from '@actions/github'
import { SubmitMetrics } from '../client'
import { GitHubContext } from '../types'
import { computeScheduleMetrics } from './metrics'

type Inputs = {
  githubToken: string
}

export const handleSchedule = async (submitMetrics: SubmitMetrics, context: GitHubContext, inputs: Inputs) => {
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
