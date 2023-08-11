import * as core from '@actions/core'
import { v1 } from '@datadog/datadog-api-client'
import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'
import { Attributes, Meter } from '@opentelemetry/api'

import { inferRunner, parseWorkflowFile, WorkflowDefinition } from './parse'
import { CompletedCheckSuite } from '../queries/completedCheckSuite'

const computeCommonTags = (e: WorkflowRunCompletedEvent): string[] => [
  `repository_owner:${e.workflow_run.repository.owner.login}`,
  `repository_name:${e.workflow_run.repository.name}`,
  `workflow_id:${e.workflow_run.id}`,
  `workflow_name:${e.workflow_run.name}`,
  `run_attempt:${e.workflow_run.run_attempt}`,
  `event:${e.workflow_run.event}`,
  `sender:${e.sender.login}`,
  `sender_type:${e.sender.type}`,
  `branch:${e.workflow_run.head_branch}`,
  `default_branch:${(e.workflow_run.head_branch === e.repository.default_branch).toString()}`,
  ...e.workflow_run.pull_requests.map((pull) => `pull_request_number:${pull.number}`),
]

const getCommonAttributes = (e: WorkflowRunCompletedEvent): Attributes => ({
  'repository.owner': e.workflow_run.repository.owner.login,
  'repository.name': e.workflow_run.repository.name,

  'workflow_run.id': e.workflow_run.id,
  'workflow_run.name': e.workflow_run.name,
  'workflow_run.run_attempt': e.workflow_run.run_attempt,
  'workflow_run.event': e.workflow_run.event,
  'workflow_run.pull_requests': e.workflow_run.pull_requests.map((pull) => pull.number),

  'event.sender': e.sender.login,
  'event.sender_type': e.sender.type,

  'branch.name': e.workflow_run.head_branch,
  'branch.is_default': e.workflow_run.head_branch === e.repository.default_branch,
})

export type WorkflowRunJobStepMetrics = {
  workflowRunMetrics: v1.Series[]
  jobMetrics: v1.Series[]
  stepMetrics: v1.Series[]
}

export type WorkflowRunJobStepMetrics2 = {
  workflowRunMetrics: v1.Series[]
  jobMetrics: v1.Series[]
  stepMetrics: v1.Series[]
}

export const computeWorkflowRunJobStepMetrics = (
  e: WorkflowRunCompletedEvent,
  meter: Meter,
  checkSuite?: CompletedCheckSuite
) => {
  if (checkSuite === undefined) {
    return { workflowRunMetrics: computeWorkflowRunMetrics(e, meter), jobMetrics: [], stepMetrics: [] }
  }

  let workflowDefinition
  try {
    workflowDefinition = parseWorkflowFile(checkSuite.node.commit.file.object.text)
  } catch (error) {
    core.warning(`Invalid workflow file: ${String(error)}`)
  }
  if (workflowDefinition) {
    core.info(`Found ${Object.keys(workflowDefinition.jobs).length} job(s) in the workflow file`)
  }

  return {
    workflowRunMetrics: computeWorkflowRunMetrics(e, meter, checkSuite),
    // jobMetrics: computeJobMetrics(e, checkSuite, workflowDefinition),
    // stepMetrics: computeStepMetrics(e, checkSuite, workflowDefinition),
  }
}

export const computeWorkflowRunMetrics = (
  e: WorkflowRunCompletedEvent,
  meter: Meter,
  checkSuite?: CompletedCheckSuite
) => {
  const attributes = getCommonAttributes(e)
  const updatedAt = unixTime(e.workflow_run.updated_at)

  const conclusionCount = meter.createCounter(`github.actions.workflow_run.total`)
  conclusionCount.add(1, { ...attributes, conclusion: e.workflow_run.conclusion })

  const runStartedAt = unixTime(e.workflow_run.run_started_at)
  const duration = updatedAt - runStartedAt

  // TODO: Gauge or Histogram?
  // const durationGauge = meter.createObservableGauge('github.actions.workflow_run.duration_second', { unit: 'seconds' })
  // durationGauge.addCallback((result) => {
  //   result.observe(duration, attributes)
  // })
  const durationHistogram = meter.createHistogram('github.actions.workflow_run.duration', { unit: 'seconds' })
  durationHistogram.record(duration, { ...attributes, conclusion: e.workflow_run.conclusion })

  if (checkSuite !== undefined) {
    const queuedTime = computeWorkflowRunQueuedTime(checkSuite, runStartedAt)
    if (queuedTime !== undefined) {
      // const queuedTimeGauge = meter.createObservableGauge('github.actions.workflow_run.queued_duration_second', {
      //   unit: 'seconds',
      // })
      // queuedTimeGauge.addCallback((result) => {
      //   result.observe(queuedTime, attributes)
      // })

      const queuedTimeHistogram = meter.createHistogram('github.actions.workflow_run.queued_duration', {
        unit: 'seconds',
      })
      queuedTimeHistogram.record(queuedTime, { ...attributes, conclusion: e.workflow_run.conclusion })
    }
  }
}

const computeWorkflowRunQueuedTime = (checkSuite: CompletedCheckSuite, workflowRunStartedAt: number) => {
  // If a partial job is rerun manually, the checkSuite contains all attempts.
  // It needs to filter the jobs which started after rerun.
  const effectiveJobStartedAt = checkSuite.node.checkRuns.nodes
    .map((checkRun) => unixTime(checkRun.startedAt))
    .filter((jobStartedAt) => jobStartedAt > workflowRunStartedAt)
  if (effectiveJobStartedAt.length > 0) {
    const firstJobStartedAt = Math.min(...effectiveJobStartedAt)
    return firstJobStartedAt - workflowRunStartedAt
  }
}

export const computeJobMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite: CompletedCheckSuite,
  workflowDefinition?: WorkflowDefinition
): v1.Series[] => {
  const series: v1.Series[] = []

  for (const checkRun of checkSuite.node.checkRuns.nodes) {
    // lower case for backward compatibility
    const conclusion = String(checkRun.conclusion).toLowerCase()
    const status = String(checkRun.status).toLowerCase()

    const completedAt = unixTime(checkRun.completedAt)
    const tags = [
      ...computeCommonTags(e),
      `job_id:${String(checkRun.databaseId)}`,
      `job_name:${checkRun.name}`,
      `conclusion:${conclusion}`,
      `status:${status}`,
    ]
    const runsOn = inferRunner(checkRun.name, workflowDefinition)
    if (runsOn !== undefined) {
      tags.push(`runs_on:${runsOn}`)
    }

    series.push(
      {
        host: 'github.com',
        tags,
        metric: 'github.actions.job.total',
        type: 'count',
        points: [[completedAt, 1]],
      },
      {
        host: 'github.com',
        tags,
        metric: `github.actions.job.conclusion.${conclusion}_total`,
        type: 'count',
        points: [[completedAt, 1]],
      }
    )

    const startedAt = unixTime(checkRun.startedAt)
    const duration = completedAt - startedAt
    series.push({
      host: 'github.com',
      tags,
      metric: 'github.actions.job.duration_second',
      type: 'gauge',
      points: [[completedAt, duration]],
    })

    if (checkRun.annotations.nodes.some((a) => isLostCommunicationWithServerError(a.message))) {
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.lost_communication_with_server_error_total',
        type: 'count',
        points: [[completedAt, 1]],
      })
    }

    if (checkRun.annotations.nodes.some((a) => isReceivedShutdownSignalError(a.message))) {
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.job.received_shutdown_signal_error_total',
        type: 'count',
        points: [[completedAt, 1]],
      })
    }
  }
  return series
}

export const isLostCommunicationWithServerError = (message: string): boolean =>
  /^The self-hosted runner: .+? lost communication with the server./.test(message)

export const isReceivedShutdownSignalError = (message: string): boolean =>
  message.startsWith('The runner has received a shutdown signal.')

export const computeStepMetrics = (
  e: WorkflowRunCompletedEvent,
  checkSuite: CompletedCheckSuite,
  workflowDefinition?: WorkflowDefinition
): v1.Series[] => {
  const series: v1.Series[] = []
  for (const checkRun of checkSuite.node.checkRuns.nodes) {
    const runsOn = inferRunner(checkRun.name, workflowDefinition)

    for (const s of checkRun.steps.nodes) {
      // lower case for backward compatibility
      const conclusion = String(s.conclusion).toLowerCase()
      const status = String(s.status).toLowerCase()
      const completedAt = unixTime(s.completedAt)
      const tags = [
        ...computeCommonTags(e),
        `job_id:${String(checkRun.databaseId)}`,
        `job_name:${checkRun.name}`,
        `step_name:${s.name}`,
        `step_number:${s.number}`,
        `conclusion:${conclusion}`,
        `status:${status}`,
      ]
      if (runsOn !== undefined) {
        tags.push(`runs_on:${runsOn}`)
      }

      series.push(
        {
          host: 'github.com',
          tags,
          metric: 'github.actions.step.total',
          type: 'count',
          points: [[completedAt, 1]],
        },
        {
          host: 'github.com',
          tags,
          metric: `github.actions.step.conclusion.${conclusion}_total`,
          type: 'count',
          points: [[completedAt, 1]],
        }
      )

      const startedAt = unixTime(s.startedAt)
      const duration = completedAt - startedAt
      series.push({
        host: 'github.com',
        tags,
        metric: 'github.actions.step.duration_second',
        type: 'gauge',
        points: [[completedAt, duration]],
      })
    }
  }
  return series
}

const unixTime = (s: string): number => Date.parse(s) / 1000
