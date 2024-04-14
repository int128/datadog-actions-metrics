import { Context } from '@actions/github/lib/context.js'
import { GitHub } from '@actions/github/lib/utils.js'
import { Endpoints } from '@octokit/types'

export type GitHubContext = Pick<Context, 'eventName' | 'payload' | 'repo'>

export type Octokit = InstanceType<typeof GitHub>

export type WorkflowJobs =
  Endpoints['GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs']['response']['data']

export type ListWorkflowRunsForRepoRateLimitResponse = Endpoints['GET /repos/{owner}/{repo}/actions/runs']['response']

export type RateLimitResponse = Endpoints['GET /rate_limit']['response']
