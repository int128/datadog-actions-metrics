import { Endpoints } from '@octokit/types'

export type WorkflowJobs =
  Endpoints['GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs']['response']['data']['jobs']

export type ListWorkflowRunsForRepoRateLimitResponse = Endpoints['GET /repos/{owner}/{repo}/actions/runs']['response']

export type RateLimitResponse = Endpoints['GET /rate_limit']['response']
