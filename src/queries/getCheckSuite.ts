import assert from 'assert'
import { GetCheckSuiteQuery, GetCheckSuiteQueryVariables } from '../generated/graphql.js'
import { CheckAnnotation, CheckRun } from '../generated/graphql-types.js'
import { Octokit } from '../types.js'

const query = /* GraphQL */ `
  query getCheckSuite($node_id: ID!) {
    node(id: $node_id) {
      __typename
      ... on CheckSuite {
        checkRuns(first: 100, filterBy: { checkType: LATEST }) {
          nodes {
            databaseId
            annotations(first: 10) {
              nodes {
                message
              }
            }
          }
        }
      }
    }
  }
`

export type CompletedCheckSuite = {
  node: {
    __typename: 'CheckSuite'
    checkRuns: {
      nodes: CompletedCheckRun[]
    }
  }
}

type CompletedCheckRun = Pick<CheckRun, 'databaseId'> & {
  annotations: {
    nodes: Pick<CheckAnnotation, 'message'>[]
  }
}

export const getCompletedCheckSuite = async (
  o: Octokit,
  v: GetCheckSuiteQueryVariables,
): Promise<CompletedCheckSuite> => {
  const r = await o.graphql<GetCheckSuiteQuery>(query, v)
  return {
    node: {
      __typename: 'CheckSuite',
      checkRuns: extractCheckRuns(r),
    },
  }
}

export const extractCheckRuns = (r: GetCheckSuiteQuery): CompletedCheckSuite['node']['checkRuns'] => {
  assert(r.node != null)
  assert.strictEqual(r.node.__typename, 'CheckSuite')

  const checkRuns: CompletedCheckRun[] = []
  for (const checkRun of r.node.checkRuns?.nodes ?? []) {
    if (checkRun == null) {
      continue
    }

    const annotations = []
    for (const annotation of checkRun.annotations?.nodes ?? []) {
      if (annotation == null) {
        continue
      }
      annotations.push(annotation)
    }

    checkRuns.push({
      ...checkRun,
      annotations: {
        nodes: annotations,
      },
    })
  }
  return { nodes: checkRuns }
}
