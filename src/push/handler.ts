import * as core from '@actions/core'
import { SubmitMetrics } from '../client'
import { PushEvent } from '@octokit/webhooks-types'
import { computePushMetrics } from './metrics'

export const handlePush = async (submitMetrics: SubmitMetrics, e: PushEvent) => {
  core.info(`Got push event: ${e.compare}`)
  return await submitMetrics(computePushMetrics(e, new Date()), 'push')
}
