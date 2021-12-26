import { computeJobMetrics, computeStepMetrics, computeWorkflowRunMetrics } from '../../src/workflowRun/metrics'
import { exampleCompletedCheckSuite } from './fixtures/checkSuite'
import { exampleJobMetrics, exampleStepMetrics, exampleWorkflowRunMetrics } from './fixtures/metrics'
import { exampleWorkflowRunEvent } from './fixtures/workflowRunEvent'

test('computeWorkflowRunMetrics', () => {
  const series = computeWorkflowRunMetrics(exampleWorkflowRunEvent, exampleCompletedCheckSuite)
  expect(series).toStrictEqual(exampleWorkflowRunMetrics)
})

test('computeJobMetrics', () => {
  const series = computeJobMetrics(exampleWorkflowRunEvent, exampleCompletedCheckSuite)
  expect(series).toStrictEqual(exampleJobMetrics)
})

test('computeStepMetrics', () => {
  const series = computeStepMetrics(exampleWorkflowRunEvent, exampleCompletedCheckSuite)
  expect(series).toStrictEqual(exampleStepMetrics)
})
