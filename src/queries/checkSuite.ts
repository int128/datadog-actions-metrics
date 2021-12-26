import { CompletedCheckSuiteQuery, CompletedCheckSuiteQueryVariables } from '../generated/graphql'
import { CheckRun, CheckStep } from '../generated/graphql-types'
import { Octokit } from '../types'

const query = /* GraphQL */ `
  query completedCheckSuite($node_id: ID!) {
    node(id: $node_id) {
      ... on CheckSuite {
        checkRuns(first: 100, filterBy: { checkType: LATEST }) {
          nodes {
            databaseId
            name
            startedAt
            completedAt
            conclusion
            status
            steps(first: 50) {
              nodes {
                number
                name
                conclusion
                status
                startedAt
                completedAt
              }
            }
          }
        }
      }
    }
  }
`

type NonNullablePick<T, K extends keyof T> = {
  [P in K]-?: NonNullable<T[P]>
}

export type CompletedCheckSuite = {
  node: {
    __typename: 'CheckSuite'
    checkRuns: {
      nodes: CompletedCheckRun[]
    }
  }
}

type CompletedCheckRun = Pick<CheckRun, 'databaseId' | 'name' | 'status'> &
  NonNullablePick<CheckRun, 'startedAt' | 'completedAt' | 'conclusion'> & {
    steps: {
      nodes: CompletedStep[]
    }
  }

type CompletedStep = Pick<CheckStep, 'number' | 'name' | 'status'> &
  NonNullablePick<CheckStep, 'startedAt' | 'completedAt' | 'conclusion'>

export const queryCompletedCheckSuite = async (
  o: Octokit,
  v: CompletedCheckSuiteQueryVariables
): Promise<CompletedCheckSuite | undefined> => {
  const r = await o.graphql<CompletedCheckSuiteQuery>(query, v)
  if (r.node?.__typename !== 'CheckSuite') {
    throw new Error(`invalid __typename ${String(r.node?.__typename)}`)
  }

  const checkRuns: CompletedCheckRun[] = []
  for (const checkRun of r.node.checkRuns?.nodes ?? []) {
    if (checkRun == null) {
      continue
    }

    const steps: CompletedStep[] = []
    for (const step of checkRun.steps?.nodes ?? []) {
      if (step == null) {
        continue
      }
      const { startedAt, completedAt, conclusion } = step
      if (startedAt == null || completedAt == null || conclusion == null) {
        continue
      }
      steps.push({
        ...step,
        startedAt,
        completedAt,
        conclusion,
      })
    }

    const { startedAt, completedAt, conclusion } = checkRun
    if (startedAt == null || completedAt == null || conclusion == null) {
      continue
    }
    checkRuns.push({
      ...checkRun,
      startedAt,
      completedAt,
      conclusion,
      steps: { nodes: steps },
    })
  }

  if (checkRuns.length < 1) {
    return
  }
  return {
    node: {
      __typename: 'CheckSuite',
      checkRuns: { nodes: checkRuns },
    },
  }
}
