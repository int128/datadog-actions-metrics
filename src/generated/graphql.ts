import * as Types from './graphql-types';

export type ClosedPullRequestQueryVariables = Types.Exact<{
  owner: Types.Scalars['String'];
  name: Types.Scalars['String'];
  number: Types.Scalars['Int'];
}>;


export type ClosedPullRequestQuery = { __typename?: 'Query', repository?: { __typename?: 'Repository', pullRequest?: { __typename?: 'PullRequest', commits: { __typename?: 'PullRequestCommitConnection', nodes?: Array<{ __typename?: 'PullRequestCommit', commit: { __typename?: 'Commit', authoredDate: string, committedDate: string } } | null | undefined> | null | undefined } } | null | undefined } | null | undefined };
