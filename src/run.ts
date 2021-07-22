import * as core from '@actions/core'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { WorkflowRunEvent } from '@octokit/webhooks-definitions/schema'
import { computeWorkflowRunMetrics } from './metrics'

type Inputs = {
  githubToken: string
  datadogApiKey?: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  if (github.context.eventName === 'workflow_run') {
    const e = github.context.payload as WorkflowRunEvent
    const configuration = v1.createConfiguration({ authMethods: { apiKeyAuth: inputs.datadogApiKey } })
    const metrics = new v1.MetricsApi(configuration)
    return await handleWorkflowRun(e, metrics, inputs.datadogApiKey === undefined)
  }
  core.warning(`unknown event ${github.context.eventName}`)
}

const handleWorkflowRun = async (e: WorkflowRunEvent, metrics: v1.MetricsApi, dryRun: boolean): Promise<void> => {
  if (dryRun) {
    core.startGroup('Event payload')
    core.info(JSON.stringify(e, undefined, 2))
    core.endGroup()
  }

  const workflowRunMetrics = computeWorkflowRunMetrics(e)
  const metricsPayload = {
    series: workflowRunMetrics,
  }

  core.startGroup(`Send metrics to Datadog ${dryRun ? '(dry-run)' : ''}`)
  core.info(JSON.stringify(metricsPayload, undefined, 2))
  if (!dryRun) {
    const accepted = await metrics.submitMetrics({ body: metricsPayload })
    core.info(`sent as ${accepted.status}`)
  }
  core.endGroup()
}
