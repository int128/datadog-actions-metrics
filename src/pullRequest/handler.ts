import * as core from '@actions/core'
import * as github from '@actions/github'
import { SubmitMetrics } from '../client'
import { PullRequestEvent } from '@octokit/webhooks-types'
import { GitHubContext } from '../types'
import { computePullRequestClosedMetrics, computePullRequestOpenedMetrics } from './metrics'
import { getPullRequestFirstCommit } from '../queries/getPullRequest'

type Inputs = {
  githubToken: string
  sendPullRequestLabels: boolean
}

export const handlePullRequest = async (
  submitMetrics: SubmitMetrics,
  e: PullRequestEvent,
  context: GitHubContext,
  inputs: Inputs,
) => {
  core.info(`Got pull request ${e.action} event: ${e.pull_request.html_url}`)

  if (e.action === 'opened') {
    return await submitMetrics(computePullRequestOpenedMetrics(e), 'pull request')
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
    return await submitMetrics(computePullRequestClosedMetrics(e, pullRequestFirstCommit, inputs), 'pull request')
  }

  core.warning(`Not supported action ${e.action}`)
}
