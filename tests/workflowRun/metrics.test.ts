import { WorkflowDefinition } from '../../src/workflowRun/parse'
import {
  computeJobMetrics,
  computeStepMetrics,
  computeWorkflowRunMetrics,
  isLostCommunicationWithServerError,
  isReceivedShutdownSignalError,
} from '../../src/workflowRun/metrics'
import { exampleCompletedCheckSuite } from './fixtures/completedCheckSuite'
import { exampleWorkflowRunCompletedEvent } from '../fixtures'

const exampleWorkflowDefinition: WorkflowDefinition = {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
    },
  },
}

// test('computeWorkflowRunMetrics', () => {
//   const series = computeWorkflowRunMetrics(exampleWorkflowRunCompletedEvent, exampleCompletedCheckSuite)
//   expect(series).toMatchSnapshot()
// })

test('computeJobMetrics', () => {
  const series = computeJobMetrics(
    exampleWorkflowRunCompletedEvent,
    exampleCompletedCheckSuite,
    exampleWorkflowDefinition
  )
  expect(series).toMatchSnapshot()
})

test('computeStepMetrics', () => {
  const series = computeStepMetrics(
    exampleWorkflowRunCompletedEvent,
    exampleCompletedCheckSuite,
    exampleWorkflowDefinition
  )
  expect(series).toMatchSnapshot()
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

describe('isReceivedShutdownSignalError', () => {
  test('matched', () => {
    expect(
      isReceivedShutdownSignalError(
        `The runner has received a shutdown signal. This can happen when the runner service is stopped, or a manually started runner is canceled.`
      )
    ).toBeTruthy()
  })
  test('not related error', () => {
    expect(isReceivedShutdownSignalError(`Process exit 1`)).toBeFalsy()
  })
})
