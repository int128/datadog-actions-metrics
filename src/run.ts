import * as core from '@actions/core'
import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { MetricsPayload } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/MetricsPayload'
import { WorkflowRunEvent } from '@octokit/webhooks-definitions/schema'

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
  core.startGroup('Parse event')
  const metricsPayload = computeWorkflowRunMetrics(e)
  if (dryRun) {
    core.info(JSON.stringify(e, undefined, 2))
  }
  core.endGroup()

  core.startGroup(`Send metrics to Datadog ${dryRun ? '(dry-run)' : ''}`)
  core.info(JSON.stringify(metricsPayload, undefined, 2))
  if (!dryRun) {
    const accepted = await metrics.submitMetrics({ body: metricsPayload })
    core.info(`sent as ${accepted.status}`)
  }
  core.endGroup()
}

export const computeWorkflowRunMetrics = (e: WorkflowRunEvent): MetricsPayload => {
  const updatedAt = new Date(e.workflow_run.updated_at).getTime() / 1000
  const tags = [
    `repository_owner:${e.workflow_run.repository.owner.login}`,
    `repository_name:${e.workflow_run.repository.name}`,
    `workflow_name:${e.workflow_run.name}`,
    `event:${e.workflow_run.event}`,
    `conclusion:${e.workflow_run.conclusion}`,
    `branch:${e.workflow_run.head_branch}`,
  ]
  return {
    series: [
      {
        host: 'github.com',
        tags,
        metric: 'github.actions.workflow_run.total',
        type: 'count',
        points: [[updatedAt, 1]],
      },
      {
        host: 'github.com',
        tags,
        metric: `github.actions.workflow_run.conclusion.${e.workflow_run.conclusion}_total`,
        type: 'count',
        points: [[updatedAt, 1]],
      },
    ],
  }
}
