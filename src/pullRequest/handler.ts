import * as core from '@actions/core'
import * as github from '@actions/github'
import { MetricsClient } from '../client.js'
import { PullRequestEvent } from '@octokit/webhooks-types/schema.js'
import { GitHubContext } from '../types.js'
import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from './metrics.js'
import { getPullRequestFirstCommit } from '../queries/getPullRequest.js'

type Inputs = {
  githubToken: string
  sendPullRequestLabels: boolean
}

export const handlePullRequest = async (
  metricsClient: MetricsClient,
  e: PullRequestEvent,
  context: GitHubContext,
  inputs: Inputs,
) => {
  core.info(`Got pull request ${e.action} event: ${e.pull_request.html_url}`)

  if (e.action === 'opened') {
    return await metricsClient.submitMetrics(computePullRequestOpenedMetrics(e), 'pull request')
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
    return await metricsClient.submitMetrics(
      computePullRequestClosedMetrics(e, pullRequestFirstCommit, inputs),
      'pull request',
    )
  }

  core.warning(`Not supported action ${e.action}`)
}
