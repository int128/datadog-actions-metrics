import * as core from '@actions/core'
import type { Octokit } from '@octokit/action'
import type { PullRequestEvent } from '@octokit/webhooks-types/schema.js'
import type { MetricsClient } from '../client.js'
import type * as github from '../github.js'
import { getPullRequestFirstCommit, type PullRequestFirstCommit } from '../queries/getPullRequest.js'
import {
  computePullRequestClosedMetrics,
  computePullRequestDequeuedMetrics,
  computePullRequestOpenedMetrics,
} from './metrics.js'

type Inputs = {
  sendPullRequestLabels: boolean
}

export const handlePullRequest = async (
  metricsClient: MetricsClient,
  octokit: Octokit,
  e: PullRequestEvent,
  context: github.Context,
  inputs: Inputs,
) => {
  core.info(`Got pull request ${e.action} event: ${e.pull_request.html_url}`)

  if (e.action === 'opened') {
    return await metricsClient.submitMetrics(computePullRequestOpenedMetrics(e), 'pull request')
  }

  if (e.action === 'closed') {
    core.info(`Finding the first commit of the pull request #${e.pull_request.number}`)
    let pullRequestFirstCommit: PullRequestFirstCommit | undefined
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

  if (e.action === 'dequeued') {
    return await metricsClient.submitMetrics(computePullRequestDequeuedMetrics(e), 'pull request')
  }

  core.warning(`Not supported action ${e.action}`)
}
