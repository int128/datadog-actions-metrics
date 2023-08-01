import { Context } from '@actions/github/lib/context'
import { GitHub } from '@actions/github/lib/utils'
import { Endpoints } from '@octokit/types'

export type GitHubContext = Pick<Context, 'eventName' | 'payload' | 'repo'>

export type Octokit = InstanceType<typeof GitHub>

export type ListWorkflowRunsForRepoRateLimitResponse = Endpoints['GET /repos/{owner}/{repo}/actions/runs']['response']

export type RateLimitResponse = Endpoints['GET /rate_limit']['response']

export type ActionInputs = {
  githubToken: string
  githubTokenForRateLimitMetrics: string
  // datadogApiKey?: string
  // datadogSite?: string
  collectJobMetrics: boolean
  collectStepMetrics: boolean
  sendPullRequestLabels: boolean

  gcpProjectId?: string
  useConsoleExporter?: boolean
}
