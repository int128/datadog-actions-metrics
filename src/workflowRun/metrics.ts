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
  'workflow_run.conclusion': e.workflow_run.conclusion,
  'workflow_run.pull_requests': e.workflow_run.pull_requests.map((pull) => pull.number),

  'event.sender': e.sender.login,
  'event.sender_type': e.sender.type,

  'branch.name': e.workflow_run.head_branch,
  'branch.is_default': e.workflow_run.head_branch === e.repository.default_branch,
})

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
    jobMetrics: computeJobMetrics(e, meter, checkSuite, workflowDefinition),
    // stepMetrics: computeStepMetrics(e, checkSuite, workflowDefinition),
  }
}

export const computeWorkflowRunMetrics = (
  e: WorkflowRunCompletedEvent,
  meter: Meter,
  checkSuite?: CompletedCheckSuite
) => {
  const attributes = getCommonAttributes(e)

  const runCount = meter.createCounter(`github.actions.workflow_run.total`)
  runCount.add(1, attributes)

  const updatedAt = unixTime(e.workflow_run.updated_at)
  const runStartedAt = unixTime(e.workflow_run.run_started_at)
  const duration = updatedAt - runStartedAt

  const durationHistogram = meter.createHistogram('github.actions.workflow_run.duration', { unit: 'seconds' })
  durationHistogram.record(duration, attributes)

  if (checkSuite !== undefined) {
    const queuedTime = computeWorkflowRunQueuedTime(checkSuite, runStartedAt)
    if (queuedTime !== undefined) {
      const queuedTimeHistogram = meter.createHistogram('github.actions.workflow_run.queued_duration', {
        unit: 'seconds',
      })
      queuedTimeHistogram.record(queuedTime, attributes)
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

type ArrayElement<T> = T extends Array<infer U> ? U : T

const getJobAttributes = (
  checkRun: ArrayElement<CompletedCheckSuite['node']['checkRuns']['nodes']>,
  workflowDefinition?: WorkflowDefinition
): Attributes => {
  const runsOn = inferRunner(checkRun.name, workflowDefinition)

  const foo: Attributes = {
    'job.name': checkRun.name,

    // lower case for backward compatibility
    'job.conclusion': String(checkRun.conclusion).toLowerCase(),
    'job.status': String(checkRun.status).toLowerCase(),

    // these fields may not be explicitly set,
    // so they may not be present
    ...(checkRun.databaseId ? { 'job.id': checkRun.databaseId } : {}),
    ...(runsOn ? { 'job.runs_on': runsOn } : {}),
  }
  return foo
}

export const computeJobMetrics = (
  e: WorkflowRunCompletedEvent,
  meter: Meter,
  checkSuite: CompletedCheckSuite,
  workflowDefinition?: WorkflowDefinition
) => {
  const baseAttributes = getCommonAttributes(e)

  for (const checkRun of checkSuite.node.checkRuns.nodes) {
    const attributes: Attributes = {
      ...baseAttributes,
      ...getJobAttributes(checkRun, workflowDefinition),
    }

    const runCount = meter.createCounter(`github.actions.job.total`)
    runCount.add(1, attributes)

    const completedAt = unixTime(checkRun.completedAt)
    const startedAt = unixTime(checkRun.startedAt)
    const duration = completedAt - startedAt

    const durationHistogram = meter.createHistogram('github.actions.job.duration', { unit: 'seconds' })
    durationHistogram.record(duration, attributes)

    // TODO: Do these need to be separate counters?
    // Would it be better to capture as attributes?
    if (checkRun.annotations.nodes.some((a) => isLostCommunicationWithServerError(a.message))) {
      const errorCount = meter.createCounter(`github.actions.job.lost_communication_with_server_error.total`)
      errorCount.add(1, attributes)
    }
    if (checkRun.annotations.nodes.some((a) => isReceivedShutdownSignalError(a.message))) {
      const errorCount = meter.createCounter(`github.actions.job.received_shutdown_signal_error.total`)
      errorCount.add(1, attributes)
    }
  }
}

export const isLostCommunicationWithServerError = (message: string): boolean =>
  /^The self-hosted runner: .+? lost communication with the server./.test(message)

export const isReceivedShutdownSignalError = (message: string): boolean =>
  message.startsWith('The runner has received a shutdown signal.')

export const computeStepMetrics = (
  e: WorkflowRunCompletedEvent,
  meter: Meter,
  checkSuite: CompletedCheckSuite,
  workflowDefinition?: WorkflowDefinition
) => {
  const baseAttributes = getCommonAttributes(e)

  for (const checkRun of checkSuite.node.checkRuns.nodes) {
    const jobAttributes = getJobAttributes(checkRun, workflowDefinition)

    for (const s of checkRun.steps.nodes) {
      const attributes = {
        ...baseAttributes,
        ...jobAttributes,
        'step.name': s.name,
        'step.number': s.number,

        // lower case for backward compatibility
        'step.conclusion': String(s.conclusion).toLowerCase(),
        'step.status': String(s.status).toLowerCase(),
      }

      const runCount = meter.createCounter(`github.actions.step.total`)
      runCount.add(1, attributes)

      const completedAt = unixTime(s.completedAt)
      const startedAt = unixTime(s.startedAt)
      const duration = completedAt - startedAt

      const durationHistogram = meter.createHistogram('github.actions.step.duration', { unit: 'seconds' })
      durationHistogram.record(duration, attributes)
    }
  }
}

const unixTime = (s: string): number => Date.parse(s) / 1000
