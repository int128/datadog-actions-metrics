import { CompletedCheckSuite } from '../../../src/queries/getCheckSuite'
import { CheckConclusionState, CheckStatusState } from '../../../src/generated/graphql-types'
import { GetCheckSuiteQuery } from '../../../src/generated/graphql'

const exampleWorkflowText = `
on:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
`

export const exampleCompletedCheckSuite: GetCheckSuiteQuery & CompletedCheckSuite = {
  // https://docs.github.com/en/rest/reference/actions#list-jobs-for-a-workflow-run
  node: {
    __typename: 'CheckSuite',
    checkRuns: {
      nodes: [
        {
          databaseId: 399444496,
          startedAt: '2020-01-20T17:42:40Z',
          completedAt: '2020-01-20T17:44:39Z',
          name: 'build',
          status: CheckStatusState.Completed,
          conclusion: CheckConclusionState.Success,
          annotations: { nodes: [] },
          steps: {
            nodes: [
              {
                name: 'Set up job',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 1,
                startedAt: '2020-01-20T09:42:40.000-08:00',
                completedAt: '2020-01-20T09:42:41.000-08:00',
              },
              {
                name: 'Run actions/checkout@v2',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 2,
                startedAt: '2020-01-20T09:42:41.000-08:00',
                completedAt: '2020-01-20T09:42:45.000-08:00',
              },
              {
                name: 'Set up Ruby',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 3,
                startedAt: '2020-01-20T09:42:45.000-08:00',
                completedAt: '2020-01-20T09:42:45.000-08:00',
              },
              {
                name: 'Run actions/cache@v2',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 4,
                startedAt: '2020-01-20T09:42:45.000-08:00',
                completedAt: '2020-01-20T09:42:48.000-08:00',
              },
              {
                name: 'Install Bundler',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 5,
                startedAt: '2020-01-20T09:42:48.000-08:00',
                completedAt: '2020-01-20T09:42:52.000-08:00',
              },
              {
                name: 'Install Gems',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 6,
                startedAt: '2020-01-20T09:42:52.000-08:00',
                completedAt: '2020-01-20T09:42:53.000-08:00',
              },
              {
                name: 'Run Tests',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 7,
                startedAt: '2020-01-20T09:42:53.000-08:00',
                completedAt: '2020-01-20T09:42:59.000-08:00',
              },
              {
                name: 'Deploy to Heroku',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 8,
                startedAt: '2020-01-20T09:42:59.000-08:00',
                completedAt: '2020-01-20T09:44:39.000-08:00',
              },
              {
                name: 'Post actions/cache@v2',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 16,
                startedAt: '2020-01-20T09:44:39.000-08:00',
                completedAt: '2020-01-20T09:44:39.000-08:00',
              },
              {
                name: 'Complete job',
                status: CheckStatusState.Completed,
                conclusion: CheckConclusionState.Success,
                number: 17,
                startedAt: '2020-01-20T09:44:39.000-08:00',
                completedAt: '2020-01-20T09:44:39.000-08:00',
              },
            ],
          },
        },
      ],
    },
    commit: {
      __typename: 'Commit',
      file: {
        __typename: 'TreeEntry',
        object: {
          __typename: 'Blob',
          text: exampleWorkflowText,
        },
      },
    },
  },
}
