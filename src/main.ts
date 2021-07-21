import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  try {
    await run({
      githubToken: core.getInput('github-token', { required: true }),
      datadogApiKey: core.getInput('datadog-api-key') || undefined,
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
