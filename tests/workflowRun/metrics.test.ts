import { WorkflowDefinition } from '../../src/workflowRun/parse'
import { computeJobMetrics, computeStepMetrics, computeWorkflowRunMetrics } from '../../src/workflowRun/metrics'
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
