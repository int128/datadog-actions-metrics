import * as core from '@actions/core'
import { MetricsClient } from '../client'
import { PushEvent } from '@octokit/webhooks-types'
import { computePushMetrics } from './metrics'

export const handlePush = async (metricsClient: MetricsClient, e: PushEvent) => {
  core.info(`Got push event: ${e.compare}`)
  return await metricsClient.submitMetrics(computePushMetrics(e, new Date()), 'push')
}
