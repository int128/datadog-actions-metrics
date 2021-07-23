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
  if (dryRun) {
    core.startGroup('Event payload')
    core.info(JSON.stringify(e, undefined, 2))
    core.endGroup()
  }

  core.info(`List jobs for workflow run ${e.workflow_run.id}`)
  const listJobsForWorkflowRun = await octokit.rest.actions.listJobsForWorkflowRun({
    owner: e.workflow_run.repository.owner.login,
    repo: e.workflow_run.repository.name,
    run_id: e.workflow_run.id,
    per_page: 100,
  })

  core.info(`Find workflow definition from ${e.workflow.path}`)
  const workflowDefinition = await getWorkflowDefinition(e, octokit)

  const workflowRunMetrics = computeWorkflowRunMetrics(e)
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
  const path = `${e.workflow_run.head_repository.full_name}/${e.workflow.path}@${e.workflow_run.head_sha}`
  let getWorkflowContent
  try {
    getWorkflowContent = await octokit.rest.repos.getContent({
      owner: e.workflow_run.head_repository.owner.login,
      repo: e.workflow_run.head_repository.name,
      ref: e.workflow_run.head_sha,
      path: e.workflow.path,
    })
  } catch (error) {
    core.warning(`could not get the workflow file from ${path}: ${error}`)
    return
  }
  if (!('type' in getWorkflowContent.data)) {
    core.warning(`found ${path} but response does not have field "type"`)
    return
  }
  if (!('content' in getWorkflowContent.data)) {
    core.warning(`found ${path} but response does not have field "content"`)
    return
  }

  const workflowFile = getWorkflowContent.data.content
  const p = parseWorkflowFile(workflowFile)
  if ('error' in p) {
    core.warning(`could not parse the workflow file from ${path}: ${p.error}`)
    return
  }
  return p
}
