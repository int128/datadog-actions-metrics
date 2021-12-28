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
    authoredDate: string
    committedDate: string
  }
}

export const queryClosedPullRequest = async (
  o: Octokit,
  v: ClosedPullRequestQueryVariables
): Promise<ClosedPullRequest> => {
  const r = await o.graphql<ClosedPullRequestQuery>(query, v)
  if (!r.repository?.pullRequest?.commits.nodes?.length) {
    throw new Error(`pull request contains no commit: ${JSON.stringify(r)}`)
  }
  if (r.repository.pullRequest.commits.nodes[0] == null) {
    throw new Error(`commit is null: ${JSON.stringify(r)}`)
  }
  const firstCommit = r.repository.pullRequest.commits.nodes[0].commit
  return {
    firstCommit,
  }
}
