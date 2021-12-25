import { ClosedPullRequestQuery, ClosedPullRequestQueryVariables } from '../generated/graphql'
import { Octokit } from '../types'

const query = /* GraphQL */ `
  query closedPullRequest($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        commits(first: 1) {
          nodes {
            commit {
              authoredDate
              committedDate
            }
          }
        }
      }
    }
  }
`

export type ClosedPullRequest = {
  firstCommit: {
    authoredDate: Date
    committedDate: Date
  }
}

export const queryClosedPullRequest = async (
  o: Octokit,
  v: ClosedPullRequestQueryVariables
): Promise<ClosedPullRequest | undefined> => {
  const r = await o.graphql<ClosedPullRequestQuery>(query, v)
  const firstCommit = r.repository?.pullRequest?.commits.nodes?.pop()?.commit
  if (firstCommit === undefined) {
    return
  }
  return {
    firstCommit: {
      authoredDate: new Date(firstCommit.authoredDate as string),
      committedDate: new Date(firstCommit.committedDate as string),
    },
  }
}
