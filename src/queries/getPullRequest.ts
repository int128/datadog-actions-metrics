import assert from 'assert'
import { GetPullRequestQuery, GetPullRequestQueryVariables } from '../generated/graphql.js'
import { Octokit } from '../types.js'

const query = /* GraphQL */ `
  query getPullRequest($owner: String!, $name: String!, $number: Int!) {
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

export type PullRequestFirstCommit = {
  authoredDate: string
  committedDate: string
}

export const getPullRequestFirstCommit = async (
  o: Octokit,
  v: GetPullRequestQueryVariables,
): Promise<PullRequestFirstCommit | undefined> => {
  const r = await o.graphql<GetPullRequestQuery>(query, v)
  assert(r.repository != null)
  assert(r.repository.pullRequest != null)
  assert(r.repository.pullRequest.commits != null)
  assert(r.repository.pullRequest.commits.nodes != null)
  if (r.repository.pullRequest.commits.nodes.length === 0) {
    return // pull request has no commit
  }
  assert(r.repository.pullRequest.commits.nodes[0] != null)
  return r.repository.pullRequest.commits.nodes[0].commit
}
