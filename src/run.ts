import * as core from '@actions/core'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { computeJobMetrics, computeStepMetrics, computeWorkflowRunMetrics } from './metrics'
import { parseWorkflowFile, WorkflowDefinition } from './parse_workflow'
import { Octokit } from './types'

type Inputs = {
  githubToken: string
  datadogApiKey?: string
  collectJobMetrics: boolean
}

export const run = async (inputs: Inputs): Promise<void> => {
  if (github.context.eventName === 'workflow_run') {
    const e = github.context.payload as WorkflowRunCompletedEvent
    const octokit = github.getOctokit(inputs.githubToken)
    const configuration = v1.createConfiguration({ authMethods: { apiKeyAuth: inputs.datadogApiKey } })
    const metrics = new v1.MetricsApi(configuration)
    const dryRun = inputs.datadogApiKey === undefined
    return await handleWorkflowRun(e, octokit, metrics, dryRun, inputs.collectJobMetrics)
  }
  core.warning(`unknown event ${github.context.eventName}`)
}

const handleWorkflowRun = async (
  e: WorkflowRunCompletedEvent,
  octokit: Octokit,
  metrics: v1.MetricsApi,
  dryRun: boolean,
  collectJobMetrics: boolean
): Promise<void> => {
  core.info(`Received a workflow run event: ${e.workflow_run.html_url}`)
  core.info(`head_sha = ${e.workflow_run.head_sha}`)
  core.info(`head_branch = ${e.workflow_run.head_branch}`)
  core.info(`default_branch = ${e.repository.default_branch}`)

  const series = await computeWorkflowRunEventMetrics(e, octokit, collectJobMetrics)

  core.startGroup(`Send metrics to Datadog ${dryRun ? '(dry-run)' : ''}`)
  core.info(JSON.stringify(series, undefined, 2))
  if (!dryRun) {
    const accepted = await metrics.submitMetrics({ body: { series } })
    core.info(`sent as ${JSON.stringify(accepted)}`)
  }
  core.endGroup()
}

const computeWorkflowRunEventMetrics = async (
  e: WorkflowRunCompletedEvent,
  octokit: Octokit,
  collectJobMetrics: boolean
): Promise<Series[]> => {
  if (!collectJobMetrics) {
    return computeWorkflowRunMetrics(e)
  }

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
    core.warning(`could not get the workflow definition from ${path}: ${JSON.stringify(error)}`)
  }

  const workflowRunMetrics = computeWorkflowRunMetrics(e, listJobsForWorkflowRun.data)
  const jobMetrics = computeJobMetrics(e, listJobsForWorkflowRun.data, workflowDefinition)
  const stepMetrics = computeStepMetrics(e, listJobsForWorkflowRun.data, workflowDefinition)
  return [...workflowRunMetrics, ...jobMetrics, ...stepMetrics]
}

const getWorkflowDefinition = async (
  e: WorkflowRunCompletedEvent,
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
