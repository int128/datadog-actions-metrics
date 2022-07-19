import { ClosedPullRequestQuery, ClosedPullRequestQueryVariables } from '../generated/graphql'
import { Octokit } from '../types'

const query = /* GraphQL */ `
  query closedPullRequest($owner: String!, $name: String!, $number: Int!) {
    rateLimit {
      cost
    }
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
        reviewRequests: timelineItems(itemTypes: [REVIEW_REQUESTED_EVENT], first: 1) {
          nodes {
            __typename
            ... on ReviewRequestedEvent {
              createdAt
            }
          }
        }
        reviews: timelineItems(itemTypes: [PULL_REQUEST_REVIEW], first: 1) {
          nodes {
            __typename
            ... on PullRequestReview {
              createdAt
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
  firstReviewRequest?: {
    createdAt: string
  }
  firstReview?: {
    createdAt: string
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
  return {
    firstCommit: r.repository.pullRequest.commits.nodes[0].commit,
    ...findFirstReviewRequest(r),
    ...findFirstReview(r),
  }
}

const findFirstReviewRequest = (
  r: ClosedPullRequestQuery
): Pick<ClosedPullRequest, 'firstReviewRequest'> | undefined => {
  if (!r.repository?.pullRequest?.reviewRequests.nodes?.length) {
    return undefined
  }
  if (r.repository.pullRequest.reviewRequests.nodes[0]?.__typename !== 'ReviewRequestedEvent') {
    return undefined
  }
  return {
    firstReviewRequest: r.repository.pullRequest.reviewRequests.nodes[0],
  }
}

const findFirstReview = (r: ClosedPullRequestQuery): Pick<ClosedPullRequest, 'firstReview'> | undefined => {
  if (!r.repository?.pullRequest?.reviews.nodes?.length) {
    return undefined
  }
  if (r.repository.pullRequest.reviews.nodes[0]?.__typename !== 'PullRequestReview') {
    return undefined
  }
  return {
    firstReview: r.repository.pullRequest.reviews.nodes[0],
  }
}
