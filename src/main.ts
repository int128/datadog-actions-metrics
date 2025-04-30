import * as core from '@actions/core'
import * as github from './github.js'
import { run } from './run.js'
import { createMetricsClient } from './client.js'

const main = async (): Promise<void> => {
  await run(
    createMetricsClient({
      datadogApiKey: core.getInput('datadog-api-key') || undefined,
      datadogSite: core.getInput('datadog-site') || undefined,
      datadogTags: core.getMultilineInput('datadog-tags'),
      metricsPatterns: core.getMultilineInput('metrics-patterns'),
    }),
    github.getOctokit(core.getInput('github-token', { required: true })),
    github.getOctokit(core.getInput('github-token-rate-limit-metrics', { required: true })),
    await github.getContext(),
    {
      collectJobMetrics: core.getBooleanInput('collect-job-metrics'),
      collectStepMetrics: core.getBooleanInput('collect-step-metrics'),
      preferDistributionWorkflowRunMetrics: core.getBooleanInput('prefer-distribution-workflow-run-metrics'),
      preferDistributionJobMetrics: core.getBooleanInput('prefer-distribution-job-metrics'),
      preferDistributionStepMetrics: core.getBooleanInput('prefer-distribution-step-metrics'),
      sendPullRequestLabels: core.getBooleanInput('send-pull-request-labels'),
    },
  )
}

await main().catch((e: Error) => {
  core.setFailed(e)
  console.error(e)
})
