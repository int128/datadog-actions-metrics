import { WorkflowDefinition } from '../../src/workflowRun/parse'
import {
  computeJobMetrics,
  computeStepMetrics,
  computeWorkflowRunMetrics,
  isLostCommunicationWithServerError,
} from '../../src/workflowRun/metrics'
import { exampleCompletedCheckSuite } from './fixtures/completedCheckSuite'
import { exampleJobMetrics, exampleStepMetrics, exampleWorkflowRunMetrics } from './fixtures/metrics'
import { exampleWorkflowRunEvent } from './fixtures/workflowRunEvent'

const exampleWorkflowDefinition: WorkflowDefinition = {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
    },
  },
}

test('computeWorkflowRunMetrics', () => {
  const series = computeWorkflowRunMetrics(exampleWorkflowRunEvent, exampleCompletedCheckSuite)
  expect(series).toStrictEqual(exampleWorkflowRunMetrics)
})

test('computeJobMetrics', () => {
  const series = computeJobMetrics(exampleWorkflowRunEvent, exampleCompletedCheckSuite, exampleWorkflowDefinition)
  expect(series).toStrictEqual(exampleJobMetrics)
})

test('computeStepMetrics', () => {
  const series = computeStepMetrics(exampleWorkflowRunEvent, exampleCompletedCheckSuite, exampleWorkflowDefinition)
  expect(series).toStrictEqual(exampleStepMetrics)
})

describe('isLostCommunicationWithServerError', () => {
  test('matched', () => {
    expect(
      isLostCommunicationWithServerError(
        `The self-hosted runner: POD-NAME lost communication with the server. Verify the machine is running and has a healthy network connection. Anything in your workflow that terminates the runner process, starves it for CPU/Memory, or blocks its network access can cause this error.`
      )
    ).toBeTruthy()
  })
  test('not related error', () => {
    expect(isLostCommunicationWithServerError(`Process exit 1`)).toBeFalsy()
  })
})
