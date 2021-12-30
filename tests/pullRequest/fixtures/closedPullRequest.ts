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
    },
  },
}

export const exampleClosedPullRequest: ClosedPullRequest = {
  firstCommit: {
    authoredDate: '2019-05-15T15:00:11Z',
    committedDate: '2019-05-15T15:11:22Z',
  },
}
