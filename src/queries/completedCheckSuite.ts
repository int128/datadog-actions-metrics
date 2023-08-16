import assert from 'assert'
import { CompletedCheckSuiteQuery, CompletedCheckSuiteQueryVariables } from '../generated/graphql'
import { CheckAnnotation, CheckRun, CheckStep } from '../generated/graphql-types'
import { Octokit } from '../types'

const query = /* GraphQL */ `
  query completedCheckSuite($node_id: ID!, $workflow_path: String!) {
    node(id: $node_id) {
      __typename
      ... on CheckSuite {
        checkRuns(first: 100, filterBy: { checkType: LATEST }) {
          nodes {
            databaseId
            name
            startedAt
            completedAt
            conclusion
            status
            annotations(first: 10) {
              nodes {
                message
              }
            }
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
        commit {
          file(path: $workflow_path) {
            object {
              __typename
              ... on Blob {
                text
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
    commit: {
      file: {
        object: {
          text: string
        }
      }
    }
  }
}

type CompletedCheckRun = Pick<CheckRun, 'databaseId' | 'name' | 'status'> &
  NonNullablePick<CheckRun, 'startedAt' | 'completedAt' | 'conclusion'> & {
    annotations: {
      nodes: Pick<CheckAnnotation, 'message'>[]
    }
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
  return {
    node: {
      __typename: 'CheckSuite',
      checkRuns: extractCheckRuns(r),
      commit: extractCommit(r),
    },
  }
}

const extractCheckRuns = (r: CompletedCheckSuiteQuery): CompletedCheckSuite['node']['checkRuns'] => {
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
      annotations: { nodes: annotations },
      steps: { nodes: steps },
    })
  }
  return { nodes: checkRuns }
}

const extractCommit = (r: CompletedCheckSuiteQuery): CompletedCheckSuite['node']['commit'] => {
  assert(r.node != null)
  assert.strictEqual(r.node.__typename, 'CheckSuite')
  assert(r.node.commit.file != null)
  assert(r.node.commit.file.object != null)
  assert.strictEqual(r.node.commit.file.object.__typename, 'Blob')
  const text = r.node.commit.file.object.text
  assert(text != null)
  return {
    file: {
      object: {
        text,
      },
    },
  }
}
