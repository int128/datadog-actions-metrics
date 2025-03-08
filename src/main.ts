import * as core from '@actions/core'
import * as github from '@actions/github'
import { run } from './run.js'

const main = async (): Promise<void> => {
  await run(github.context, {
    githubToken: core.getInput('github-token', { required: true }),
    githubTokenForRateLimitMetrics: core.getInput('github-token-rate-limit-metrics', { required: true }),
    datadogApiKey: core.getInput('datadog-api-key') || undefined,
    datadogSite: core.getInput('datadog-site') || undefined,
    datadogTags: core.getMultilineInput('datadog-tags'),
    metricsPatterns: core.getMultilineInput('metrics-patterns'),
    collectJobMetrics: core.getBooleanInput('collect-job-metrics'),
    collectStepMetrics: core.getBooleanInput('collect-step-metrics'),
    preferDistributionWorkflowRunMetrics: core.getBooleanInput('prefer-distribution-workflow-run-metrics'),
    preferDistributionJobMetrics: core.getBooleanInput('prefer-distribution-job-metrics'),
    preferDistributionStepMetrics: core.getBooleanInput('prefer-distribution-step-metrics'),
    sendPullRequestLabels: core.getBooleanInput('send-pull-request-labels'),
    tagsToExclude: core.getMultilineInput('tags-to-exclude'),
  })
}

main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
