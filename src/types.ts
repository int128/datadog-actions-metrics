import { GitHub } from '@actions/github/lib/utils'
import { Endpoints } from '@octokit/types'

export type Octokit = InstanceType<typeof GitHub>

export type ListJobsForWorkflowRun =
  Endpoints['GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs']['response']['data']
