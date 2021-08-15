import { computeJobMetrics, computeStepMetrics, computeWorkflowRunMetrics } from '../src/metrics'
import { exampleListJobsForWorkflowRun } from './fixtures/listJobsForWorkflowRun'
import { exampleJobMetrics, exampleStepMetrics, exampleWorkflowRunMetrics } from './fixtures/metrics'
import { exampleWorkflowRunEvent } from './fixtures/workflowRunEvent'

test('computeWorkflowRunMetrics', () => {
  const series = computeWorkflowRunMetrics(exampleWorkflowRunEvent, exampleListJobsForWorkflowRun)
  expect(series).toStrictEqual(exampleWorkflowRunMetrics)
})

test('computeJobMetrics', () => {
  const series = computeJobMetrics(exampleWorkflowRunEvent, exampleListJobsForWorkflowRun)
  expect(series).toStrictEqual(exampleJobMetrics)
})

test('computeStepMetrics', () => {
  const series = computeStepMetrics(exampleWorkflowRunEvent, exampleListJobsForWorkflowRun)
  expect(series).toStrictEqual(exampleStepMetrics)
})
