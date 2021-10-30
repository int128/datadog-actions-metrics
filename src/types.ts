import { Context } from '@actions/github/lib/context'
import { GitHub } from '@actions/github/lib/utils'
import { Endpoints } from '@octokit/types'

export type GitHubContext = Pick<Context, 'eventName' | 'payload' | 'repo'>

export type Octokit = InstanceType<typeof GitHub>

export type ListJobsForWorkflowRun =
  Endpoints['GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs']['response']['data']

export type GetContent = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']['response']['data']

export type RateLimitResponse = Endpoints['GET /rate_limit']['response']
