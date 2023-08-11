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
import { setupOtel } from '../../src/otel'
import { ActionInputs } from '../../src/types'
import { ActionsConsoleMetricExporter } from '../../src/otel/actionsExporter'

const setupTestMeter = (actionInputs: Partial<ActionInputs> = {}) => {
  const meterProvider = setupOtel({
    githubToken: 'STUBTOKEN',
    githubTokenForRateLimitMetrics: 'STUBTOKEN',
    collectJobMetrics: false,
    collectStepMetrics: false,
    sendPullRequestLabels: false,
    useConsoleExporter: true,
    ...actionInputs,
  })
  const meter = meterProvider.getMeter('test')
  return { meter, meterProvider }
}

beforeAll(() => {
  // this ensures timestamps in snapshots remain static
  jest.useFakeTimers({ now: new Date('2023-08-11T00:00:00') })
})

afterAll(() => {
  jest.restoreAllMocks()
  jest.useRealTimers()
})

const exampleWorkflowDefinition: WorkflowDefinition = {
  jobs: {
    build: {
      'runs-on': 'ubuntu-latest',
    },
  },
}

test('computeWorkflowRunMetrics', async () => {
  const exporterSpy = jest.spyOn(ActionsConsoleMetricExporter.prototype, 'export')

  const { meter, meterProvider } = setupTestMeter()

  computeWorkflowRunMetrics(exampleWorkflowRunCompletedEvent, meter, exampleCompletedCheckSuite)

  await meterProvider.forceFlush()
  await meterProvider.shutdown()

  expect(exporterSpy.mock.calls).toMatchSnapshot()
})

test('computeJobMetrics', async () => {
  const exporterSpy = jest.spyOn(ActionsConsoleMetricExporter.prototype, 'export')

  const { meter, meterProvider } = setupTestMeter()

  computeJobMetrics(exampleWorkflowRunCompletedEvent, meter, exampleCompletedCheckSuite, exampleWorkflowDefinition)

  await meterProvider.forceFlush()
  await meterProvider.shutdown()

  expect(exporterSpy.mock.calls).toMatchSnapshot()
})

test('computeStepMetrics', async () => {
  const exporterSpy = jest.spyOn(ActionsConsoleMetricExporter.prototype, 'export')

  const { meter, meterProvider } = setupTestMeter()

  computeStepMetrics(exampleWorkflowRunCompletedEvent, meter, exampleCompletedCheckSuite, exampleWorkflowDefinition)

  await meterProvider.forceFlush()
  await meterProvider.shutdown()

  expect(exporterSpy.mock.calls).toMatchSnapshot()
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
