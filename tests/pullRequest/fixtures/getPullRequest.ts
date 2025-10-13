import type { GetPullRequestQuery } from '../../../src/generated/graphql.js'
import type { PullRequestFirstCommit } from '../../../src/queries/getPullRequest.js'

export const exampleGetPullRequestQuery: GetPullRequestQuery = {
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

export const examplePullRequestFirstCommit: PullRequestFirstCommit = {
  authoredDate: '2019-05-15T15:00:11Z',
  committedDate: '2019-05-15T15:11:22Z',
}
