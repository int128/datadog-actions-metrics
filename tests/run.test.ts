import * as github from '@actions/github'
import { v1 } from '@datadog/datadog-api-client'
import { IntakePayloadAccepted } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/IntakePayloadAccepted'
import { run } from '../src/run'
import { exampleListJobsForWorkflowRun } from './fixtures/listJobsForWorkflowRun'
import { exampleJobMetrics, exampleStepMetrics, exampleWorkflowRunMetrics } from './fixtures/metrics'
import { exampleWorkflowRunEvent } from './fixtures/workflowRunEvent'

jest.mock('@actions/github')
const octokitMock = {
  rest: {
    actions: {
      listJobsForWorkflowRun: jest.fn(),
    },
    repos: {
      getContent: jest.fn(),
    },
  },
}
const getOctokit = github.getOctokit as jest.Mock
getOctokit.mockReturnValue(octokitMock)

jest.mock('@datadog/datadog-api-client')
const metricsApiMock = {
  submitMetrics: jest.fn<Promise<IntakePayloadAccepted>, [v1.MetricsApiSubmitMetricsRequest]>(),
}
const metricsApiConstructor = v1.MetricsApi as jest.Mock
metricsApiConstructor.mockReturnValue(metricsApiMock)

const exampleWorkflow = `
jobs:
  ts:
    runs-on: ubuntu-latest
`

test('run with mocks of GitHub and Datadog clients', async () => {
  github.context.eventName = 'workflow_run'
  github.context.payload = exampleWorkflowRunEvent
  octokitMock.rest.actions.listJobsForWorkflowRun.mockResolvedValue({
    data: exampleListJobsForWorkflowRun,
  })
  octokitMock.rest.repos.getContent.mockResolvedValue({
    data: {
      type: 'file',
      encoding: 'base64',
      content: Buffer.from(exampleWorkflow).toString('base64'),
    },
  })
  metricsApiMock.submitMetrics.mockResolvedValue({ status: 'ok' })

  await run({
    githubToken: 'GITHUB_TOKEN',
    datadogApiKey: 'DATADOG_API_KEY',
  })
  expect(getOctokit).toBeCalledWith('GITHUB_TOKEN')
  expect(metricsApiMock.submitMetrics).toBeCalledWith({
    body: {
      series: [...exampleWorkflowRunMetrics, ...exampleJobMetrics, ...exampleStepMetrics],
    },
  })
})
