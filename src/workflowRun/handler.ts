import * as core from '@actions/core'
import * as github from '@actions/github'
import { getCompletedCheckSuite } from '../queries/getCheckSuite'
import { computeWorkflowRunJobStepMetrics } from './metrics'
import { MetricsClient } from '../client'
import { WorkflowRunCompletedEvent, WorkflowRunEvent } from '@octokit/webhooks-types'

type Inputs = {
  githubToken: string
  collectJobMetrics: boolean
  collectStepMetrics: boolean
  preferDistributionWorkflowRunMetrics: boolean
  preferDistributionJobMetrics: boolean
  preferDistributionStepMetrics: boolean
}

export const handleWorkflowRun = async (metricsClient: MetricsClient, e: WorkflowRunEvent, inputs: Inputs) => {
  core.info(`Got workflow run ${e.action} event: ${e.workflow_run.html_url}`)
  if (e.action === 'completed') {
    return await handleWorkflowRunCompleted(metricsClient, e, inputs)
  }
  core.warning(`Not supported action ${e.action}`)
}

const handleWorkflowRunCompleted = async (
  metricsClient: MetricsClient,
  e: WorkflowRunCompletedEvent,
  inputs: Inputs,
) => {
  const octokit = github.getOctokit(inputs.githubToken)

  let checkSuite
  if (inputs.collectJobMetrics) {
    core.info(`Finding the check suite ${e.workflow_run.check_suite_node_id}`)
    try {
      checkSuite = await getCompletedCheckSuite(octokit, { node_id: e.workflow_run.check_suite_node_id })
    } catch (error) {
      core.warning(`Could not get the check suite: ${String(error)}`)
    }
  }
  if (checkSuite) {
    core.info(`Found the check suite with ${checkSuite.node.checkRuns.nodes.length} check run(s)`)
  }

  let workflowJobs
  if (inputs.collectJobMetrics || inputs.collectStepMetrics) {
    core.info(`Finding the jobs for the workflow run ${e.workflow_run.id}`)
    try {
      workflowJobs = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
        owner: e.workflow_run.repository.owner.login,
        repo: e.workflow_run.repository.name,
        run_id: e.workflow_run.id,
        attempt_number: e.workflow_run.run_attempt,
        per_page: 100,
      })
    } catch (error) {
      core.warning(`Could not get the jobs: ${String(error)}`)
    }
  }
  if (workflowJobs) {
    core.info(`Found ${workflowJobs.data.jobs.length} job(s)`)
  }

  const metrics = computeWorkflowRunJobStepMetrics(e, checkSuite, workflowJobs?.data, inputs)

  await metricsClient.submitMetrics(metrics.workflowRunMetrics.series, 'workflow run')
  await metricsClient.submitDistributionPoints(metrics.workflowRunMetrics.distributionPointsSeries, 'workflow run')
  if (inputs.collectJobMetrics) {
    await metricsClient.submitMetrics(metrics.jobMetrics.series, 'job')
    await metricsClient.submitDistributionPoints(metrics.jobMetrics.distributionPointsSeries, 'job')
  }
  if (inputs.collectStepMetrics) {
    await metricsClient.submitMetrics(metrics.stepMetrics.series, 'step')
    await metricsClient.submitDistributionPoints(metrics.stepMetrics.distributionPointsSeries, 'step')
  }
}
