import * as core from '@actions/core'
import { run } from './run'

const main = async (): Promise<void> => {
  try {
    await run({
      name: core.getInput('name', { required: true }),
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

main()
