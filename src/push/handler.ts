import * as core from '@actions/core'
import type { PushEvent } from '@octokit/webhooks-types'
import type { MetricsClient } from '../client.js'
import { computePushMetrics } from './metrics.js'

export const handlePush = async (metricsClient: MetricsClient, e: PushEvent) => {
  core.info(`Got push event: ${e.compare}`)
  return await metricsClient.submitMetrics(computePushMetrics(e, new Date()), 'push')
}
