import * as core from '@actions/core'
import * as github from '@actions/github'
import { getCompletedCheckSuite } from '../queries/getCheckSuite'
import { computeWorkflowRunJobStepMetrics } from './metrics'
import { SubmitMetrics } from '../client'
import { WorkflowRunEvent } from '@octokit/webhooks-types'

type Inputs = {
  githubToken: string
  collectJobMetrics: boolean
  collectStepMetrics: boolean
}

export const handleWorkflowRun = async (submitMetrics: SubmitMetrics, e: WorkflowRunEvent, inputs: Inputs) => {
  core.info(`Got workflow run ${e.action} event: ${e.workflow_run.html_url}`)

  if (e.action === 'completed') {
    let checkSuite, workflowJobs
    if (inputs.collectJobMetrics || inputs.collectStepMetrics) {
      core.info(`Finding the check suite ${e.workflow_run.check_suite_node_id}`)
      const octokit = github.getOctokit(inputs.githubToken)
      try {
        checkSuite = await getCompletedCheckSuite(octokit, { node_id: e.workflow_run.check_suite_node_id })
      } catch (error) {
        core.warning(`Could not get the check suite: ${String(error)}`)
      }
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
    if (checkSuite) {
      core.info(`Found the check suite with ${checkSuite.node.checkRuns.nodes.length} check run(s)`)
    }

    const metrics = computeWorkflowRunJobStepMetrics(e, checkSuite, workflowJobs?.data)
    await submitMetrics(metrics.workflowRunMetrics, 'workflow run')
    if (inputs.collectJobMetrics) {
      await submitMetrics(metrics.jobMetrics, 'job')
    }
    if (inputs.collectStepMetrics) {
      await submitMetrics(metrics.stepMetrics, 'step')
    }
    return
  }

  core.warning(`Not supported action ${e.action}`)
}
