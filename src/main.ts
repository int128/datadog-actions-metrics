import * as core from '@actions/core'
import * as github from '@actions/github'
import { run } from './run'

const main = async (): Promise<void> => {
  await run(github.context, {
    githubToken: core.getInput('github-token', { required: true }),
    githubTokenForRateLimitMetrics: core.getInput('github-token-rate-limit-metrics', { required: true }),
    datadogApiKey: core.getInput('datadog-api-key') || undefined,
    datadogSite: core.getInput('datadog-site') || undefined,
    datadogTags: core.getMultilineInput('datadog-tags'),
    collectJobMetrics: core.getBooleanInput('collect-job-metrics'),
    collectStepMetrics: core.getBooleanInput('collect-step-metrics'),
    sendPullRequestLabels: core.getBooleanInput('send-pull-request-labels'),
    disableDistributionMetrics: core.getBooleanInput('disable-distribution-metrics'),
    filteredMetrics: core.getMultilineInput('filtered-metrics'),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
