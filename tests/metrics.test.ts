import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'
import { computeJobMetrics, computeWorkflowRunMetrics } from '../src/metrics'
import { exampleListJobsForWorkflowRun } from './fixtures/listJobsForWorkflowRun'
import { exampleWorkflowRunEvent } from './fixtures/workflowRunEvent'

test('computeWorkflowRunMetrics', async () => {
  const metricsPayload = computeWorkflowRunMetrics(exampleWorkflowRunEvent)
  expect(metricsPayload).toStrictEqual<Series[]>([
    {
      host: 'github.com',
      metric: 'github.actions.workflow_run.total',
      points: [[1579721588, 1]],
      tags: [
        'repository_owner:octocat',
        'repository_name:Hello-World',
        'workflow_name:Build',
        'event:push',
        'conclusion:success',
        'branch:master',
        'default_branch:false',
      ],
      type: 'count',
    },
    {
      host: 'github.com',
      metric: 'github.actions.workflow_run.conclusion.success_total',
      points: [[1579721588, 1]],
      tags: [
        'repository_owner:octocat',
        'repository_name:Hello-World',
        'workflow_name:Build',
        'event:push',
        'conclusion:success',
        'branch:master',
        'default_branch:false',
      ],
      type: 'count',
    },
  ])
})

test('computeJobMetrics', async () => {
  const series = computeJobMetrics(exampleWorkflowRunEvent, exampleListJobsForWorkflowRun)
  expect(series).toStrictEqual<Series[]>([
    {
      host: 'github.com',
      metric: 'github.actions.job.total',
      points: [[1579542279, 1]],
      tags: [
        'repository_owner:octocat',
        'repository_name:Hello-World',
        'workflow_name:Build',
        'event:push',
        'branch:master',
        'default_branch:false',
        'job_name:build',
        'conclusion:success',
        'status:completed',
      ],
      type: 'count',
    },
    {
      host: 'github.com',
      metric: 'github.actions.job.conclusion.success_total',
      points: [[1579542279, 1]],
      tags: [
        'repository_owner:octocat',
        'repository_name:Hello-World',
        'workflow_name:Build',
        'event:push',
        'branch:master',
        'default_branch:false',
        'job_name:build',
        'conclusion:success',
        'status:completed',
      ],
      type: 'count',
    },
    {
      host: 'github.com',
      metric: 'github.actions.job.duration_second',
      points: [[1579542279, 119]],
      tags: [
        'repository_owner:octocat',
        'repository_name:Hello-World',
        'workflow_name:Build',
        'event:push',
        'branch:master',
        'default_branch:false',
        'job_name:build',
        'conclusion:success',
        'status:completed',
      ],
      type: 'gauge',
    },
  ])
})
