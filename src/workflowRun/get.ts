import * as core from '@actions/core'
import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { Octokit } from '../types'
import { computeJobMetrics, computeStepMetrics, computeWorkflowRunMetrics } from './metrics'
import { parseWorkflowFile, WorkflowDefinition } from './parse'

export const getWorkflowRunMetrics = computeWorkflowRunMetrics

export const getWorkflowRunMetricsWithJobsSteps = async (
  e: WorkflowRunCompletedEvent,
  octokit: Octokit
): Promise<Series[]> => {
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
