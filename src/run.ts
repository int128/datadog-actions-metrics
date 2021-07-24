import * as core from '@actions/core'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { WorkflowRunEvent } from '@octokit/webhooks-definitions/schema'
import { computeJobMetrics, computeStepMetrics, computeWorkflowRunMetrics } from './metrics'
import { parseWorkflowFile, WorkflowDefinition } from './parse_workflow'
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

  core.info(`List jobs for workflow run ${e.workflow_run.id}`)
  const listJobsForWorkflowRun = await octokit.rest.actions.listJobsForWorkflowRun({
    owner: e.workflow_run.repository.owner.login,
    repo: e.workflow_run.repository.name,
    run_id: e.workflow_run.id,
    per_page: 100,
  })

  core.info(`Parse workflow definition from ${e.workflow.path}`)
  let workflowDefinition
  try {
    workflowDefinition = await getWorkflowDefinition(e, octokit)
  } catch (error) {
    const path = `${e.workflow_run.head_repository.full_name}/${e.workflow.path}@${e.workflow_run.head_sha}`
    core.warning(`could not get the workflow definition from ${path}: ${error}`)
  }

  const workflowRunMetrics = computeWorkflowRunMetrics(e, listJobsForWorkflowRun.data)
  const jobMetrics = computeJobMetrics(e, listJobsForWorkflowRun.data, workflowDefinition)
  const stepMetrics = computeStepMetrics(e, listJobsForWorkflowRun.data, workflowDefinition)
  const metricsPayload = {
    series: [...workflowRunMetrics, ...jobMetrics, ...stepMetrics],
  }

  core.startGroup(`Send metrics to Datadog ${dryRun ? '(dry-run)' : ''}`)
  core.info(JSON.stringify(metricsPayload, undefined, 2))
  if (!dryRun) {
    const accepted = await metrics.submitMetrics({ body: metricsPayload })
    core.info(`sent as ${accepted.status}`)
  }
  core.endGroup()
}

const getWorkflowDefinition = async (
  e: WorkflowRunEvent,
  octokit: Octokit
): Promise<WorkflowDefinition | undefined> => {
  const resp = await octokit.rest.repos.getContent({
    owner: e.workflow_run.head_repository.owner.login,
    repo: e.workflow_run.head_repository.name,
    ref: e.workflow_run.head_sha,
    path: e.workflow.path,
  })
  if (!('type' in resp.data)) {
    throw new Error(`response does not have field "type"`)
  }
  if (!('content' in resp.data)) {
    throw new Error(`response does not have field "content"`)
  }
  const content = Buffer.from(resp.data.content, resp.data.encoding === 'base64' ? 'base64' : 'ascii').toString()
  return parseWorkflowFile(content)
}
