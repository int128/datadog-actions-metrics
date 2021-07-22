import * as core from '@actions/core'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { WorkflowRunEvent } from '@octokit/webhooks-definitions/schema'
import { computeJobMetrics, computeWorkflowRunMetrics } from './metrics'
import { Octokit } from './types'

type Inputs = {
  githubToken: string
  datadogApiKey?: string
}

export const run = async (inputs: Inputs): Promise<void> => {
  if (github.context.eventName === 'workflow_run') {
    const e = github.context.payload as WorkflowRunEvent
    const octokit = github.getOctokit(inputs.githubToken)
    const configuration = v1.createConfiguration({ authMethods: { apiKeyAuth: inputs.datadogApiKey } })
    const metrics = new v1.MetricsApi(configuration)
    return await handleWorkflowRun(e, octokit, metrics, inputs.datadogApiKey === undefined)
  }
  core.warning(`unknown event ${github.context.eventName}`)
}

const handleWorkflowRun = async (
  e: WorkflowRunEvent,
  octokit: Octokit,
  metrics: v1.MetricsApi,
  dryRun: boolean
): Promise<void> => {
  core.info(`Received a workflow run event: ${e.workflow_run.html_url}`)
  if (dryRun) {
    core.startGroup('Event payload')
    core.info(JSON.stringify(e, undefined, 2))
    core.endGroup()
  }

  const listJobsForWorkflowRun = await octokit.rest.actions.listJobsForWorkflowRun({
    owner: e.workflow_run.repository.owner.login,
    repo: e.workflow_run.repository.name,
    run_id: e.workflow_run.id,
    per_page: 100,
  })

  const workflowRunMetrics = computeWorkflowRunMetrics(e)
  const jobMetrics = computeJobMetrics(e, listJobsForWorkflowRun.data)
  const metricsPayload = {
    series: [...workflowRunMetrics, ...jobMetrics],
  }

  core.startGroup(`Send metrics to Datadog ${dryRun ? '(dry-run)' : ''}`)
  core.info(JSON.stringify(metricsPayload, undefined, 2))
  if (!dryRun) {
    const accepted = await metrics.submitMetrics({ body: metricsPayload })
    core.info(`sent as ${accepted.status}`)
  }
  core.endGroup()
}
