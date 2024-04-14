import { CompletedCheckSuite } from '../../../src/queries/getCheckSuite.js'
import { GetCheckSuiteQuery } from '../../../src/generated/graphql.js'

export const exampleCompletedCheckSuite: GetCheckSuiteQuery & CompletedCheckSuite = {
  // https://docs.github.com/en/rest/reference/actions#list-jobs-for-a-workflow-run
  node: {
    __typename: 'CheckSuite',
    checkRuns: {
      nodes: [
        {
          databaseId: 29679449,
          annotations: { nodes: [] },
        },
      ],
    },
  },
}
