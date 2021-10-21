import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  await run({
    githubToken: core.getInput('github-token', { required: true }),
    datadogApiKey: core.getInput('datadog-api-key') || undefined,
    collectJobMetrics: core.getBooleanInput('collect-job-metrics'),
  })
}

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)))
