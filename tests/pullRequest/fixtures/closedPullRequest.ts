import { ClosedPullRequest } from '../../../src/queries/closedPullRequest'
import { ClosedPullRequestQuery } from '../../../src/generated/graphql'

export const exampleClosedPullRequestQuery: ClosedPullRequestQuery = {
  repository: {
    pullRequest: {
      commits: {
        nodes: [
          {
            commit: {
              authoredDate: '2019-05-15T15:00:11Z',
              committedDate: '2019-05-15T15:11:22Z',
            },
          },
        ],
      },
      reviewRequests: {
        nodes: [
          {
            __typename: 'ReviewRequestedEvent',
            createdAt: '2019-05-15T15:30:00Z',
          },
        ],
      },
      reviews: {
        nodes: [
          {
            __typename: 'PullRequestReview',
            createdAt: '2019-05-15T15:40:00Z',
          },
        ],
      },
    },
  },
}

export const exampleClosedPullRequest: ClosedPullRequest = {
  firstCommit: {
    authoredDate: '2019-05-15T15:00:11Z',
    committedDate: '2019-05-15T15:11:22Z',
  },
}
