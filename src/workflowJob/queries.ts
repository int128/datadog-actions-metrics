import { Octokit } from '@octokit/action'
import { WorkflowJobCompletedEvent } from '@octokit/webhooks-types'

export type WorkflowRun = {
  id: number
  name: string
  run_attempt: number
  event: string
  run_started_at: string
  head_branch: string
  pull_requests: Array<{
    number: number
  }>
}

export const getWorkflowRunForWorkflowJob = async (
  octokit: Octokit,
  e: WorkflowJobCompletedEvent,
): Promise<WorkflowRun | null> => {
  try {
    // WorkflowJobCompletedEvent directly contains workflow run information
    const workflowRunId = e.workflow_job.run_id

    // Get detailed information of the workflow run
    const workflowRunDetails = await octokit.rest.actions.getWorkflowRun({
      owner: e.repository.owner.login,
      repo: e.repository.name,
      run_id: workflowRunId,
    })

    return {
      id: workflowRunDetails.data.id,
      name: workflowRunDetails.data.name || 'Unknown',
      run_attempt: workflowRunDetails.data.run_attempt || 1,
      event: workflowRunDetails.data.event || 'unknown',
      run_started_at: workflowRunDetails.data.run_started_at || workflowRunDetails.data.created_at,
      head_branch: workflowRunDetails.data.head_branch || 'unknown',
      pull_requests: (workflowRunDetails.data.pull_requests || []).map((pr) => ({
        number: pr.number,
      })),
    }
  } catch (error) {
    console.error(`Failed to get workflow run for workflow job ${e.workflow_job.id}:`, error)
    return null
  }
}
