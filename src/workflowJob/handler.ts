import * as core from '@actions/core'
import { MetricsClient } from '../client.js'
import { Octokit } from '@octokit/action'
import { WorkflowJobEvent, WorkflowJobCompletedEvent } from '@octokit/webhooks-types'
import { computeWorkflowJobMetrics } from './metrics.js'
import { getWorkflowRunForWorkflowJob } from './queries.js'

type Inputs = {
  collectJobMetricsRealtime: boolean
  preferDistributionJobMetrics: boolean
}

export const handleWorkflowJob = async (
  metricsClient: MetricsClient,
  octokit: Octokit,
  e: WorkflowJobEvent,
  inputs: Inputs,
) => {
  core.info(`Got workflow job ${e.action} event: ${e.workflow_job.html_url}`)

  if (e.action === 'completed' && inputs.collectJobMetricsRealtime) {
    return await handleWorkflowJobCompleted(metricsClient, octokit, e, inputs)
  }

  core.info(
    `Skipping workflow job event: action=${e.action}, collectJobMetricsRealtime=${inputs.collectJobMetricsRealtime}`,
  )
}

const handleWorkflowJobCompleted = async (
  metricsClient: MetricsClient,
  octokit: Octokit,
  e: WorkflowJobCompletedEvent,
  inputs: Inputs,
) => {
  try {
    // Get the corresponding workflow run
    const workflowRun = await getWorkflowRunForWorkflowJob(octokit, e)

    if (!workflowRun) {
      core.warning(`Could not find workflow run for workflow job ${e.workflow_job.id}`)
      return
    }

    core.info(`Found workflow run ${workflowRun.id} for workflow job ${e.workflow_job.id}`)

    // Compute metrics for individual job
    const jobMetrics = computeWorkflowJobMetrics(e, workflowRun, inputs)

    if (jobMetrics.series.length > 0) {
      await metricsClient.submitMetrics(jobMetrics.series, 'job (realtime)')
      core.info(`Submitted ${jobMetrics.series.length} job metrics for workflow job ${e.workflow_job.id}`)
    }

    if (jobMetrics.distributionPointsSeries.length > 0) {
      await metricsClient.submitDistributionPoints(jobMetrics.distributionPointsSeries, 'job (realtime)')
      core.info(
        `Submitted ${jobMetrics.distributionPointsSeries.length} job distribution metrics for workflow job ${e.workflow_job.id}`,
      )
    }
  } catch (error) {
    core.warning(`Failed to process workflow job ${e.workflow_job.id}: ${String(error)}`)
  }
}
