import { WorkflowRunCompletedEvent } from '@octokit/webhooks-types'

export const exampleWorkflowRunEvent: WorkflowRunCompletedEvent = {
  workflow: {
    // https://docs.github.com/en/rest/reference/actions#get-a-workflow
    id: 161335,
    node_id: 'MDg6V29ya2Zsb3cxNjEzMzU=',
    name: 'CI',
    path: '.github/workflows/blank.yaml',
    state: 'active',
    created_at: '2020-01-08T23:48:37.000-08:00',
    updated_at: '2020-01-08T23:50:21.000-08:00',
    url: 'https://api.github.com/repos/octo-org/octo-repo/actions/workflows/161335',
    html_url: 'https://github.com/octo-org/octo-repo/blob/master/.github/workflows/161335',
    badge_url: 'https://github.com/octo-org/octo-repo/workflows/CI/badge.svg',
  },
  workflow_run: {
    actor: {
      login: 'octocat',
      id: 1,
      node_id: 'MDQ6VXNlcjE=',
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      gravatar_id: '',
      url: 'https://api.github.com/users/octocat',
      html_url: 'https://github.com/octocat',
      followers_url: 'https://api.github.com/users/octocat/followers',
      following_url: 'https://api.github.com/users/octocat/following{/other_user}',
      gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
      organizations_url: 'https://api.github.com/users/octocat/orgs',
      repos_url: 'https://api.github.com/users/octocat/repos',
      events_url: 'https://api.github.com/users/octocat/events{/privacy}',
      received_events_url: 'https://api.github.com/users/octocat/received_events',
      type: 'User',
      site_admin: false,
    },
    triggering_actor: {
      login: 'octocat',
      id: 1,
      node_id: 'MDQ6VXNlcjE=',
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      gravatar_id: '',
      url: 'https://api.github.com/users/octocat',
      html_url: 'https://github.com/octocat',
      followers_url: 'https://api.github.com/users/octocat/followers',
      following_url: 'https://api.github.com/users/octocat/following{/other_user}',
      gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
      organizations_url: 'https://api.github.com/users/octocat/orgs',
      repos_url: 'https://api.github.com/users/octocat/repos',
      events_url: 'https://api.github.com/users/octocat/events{/privacy}',
      received_events_url: 'https://api.github.com/users/octocat/received_events',
      type: 'User',
      site_admin: false,
    },
    previous_attempt_url: null,
    run_attempt: 1,
    run_started_at: '2020-01-22T19:33:08Z',
    // https://docs.github.com/en/rest/reference/actions#get-a-workflow-run
    id: 30433642,
    name: 'Build',
    node_id: 'MDEyOldvcmtmbG93IFJ1bjI2OTI4OQ==',
    check_suite_id: 42,
    check_suite_node_id: 'MDEwOkNoZWNrU3VpdGU0Mg==',
    head_branch: 'master',
    head_sha: 'acb5820ced9479c074f688cc328bf03f341a511d',
    run_number: 562,
    event: 'push',
    status: 'queued',
    conclusion: 'success', // fixed for WorkflowRunEvent
    workflow_id: 159038,
    url: 'https://api.github.com/repos/octo-org/octo-repo/actions/runs/30433642',
    html_url: 'https://github.com/octo-org/octo-repo/actions/runs/30433642',
    pull_requests: [],
    created_at: '2020-01-22T19:33:08Z',
    updated_at: '2020-01-22T19:33:08Z',
    jobs_url: 'https://api.github.com/repos/octo-org/octo-repo/actions/runs/30433642/jobs',
    logs_url: 'https://api.github.com/repos/octo-org/octo-repo/actions/runs/30433642/logs',
    check_suite_url: 'https://api.github.com/repos/octo-org/octo-repo/check-suites/414944374',
    artifacts_url: 'https://api.github.com/repos/octo-org/octo-repo/actions/runs/30433642/artifacts',
    cancel_url: 'https://api.github.com/repos/octo-org/octo-repo/actions/runs/30433642/cancel',
    rerun_url: 'https://api.github.com/repos/octo-org/octo-repo/actions/runs/30433642/rerun',
    workflow_url: 'https://api.github.com/repos/octo-org/octo-repo/actions/workflows/159038',
    head_commit: {
      id: 'acb5820ced9479c074f688cc328bf03f341a511d',
      tree_id: 'd23f6eedb1e1b9610bbc754ddb5197bfe7271223',
      message: 'Create linter.yaml',
      timestamp: '2020-01-22T19:33:05Z',
      author: {
        name: 'Octo Cat',
        email: 'octocat@github.com',
      },
      committer: {
        name: 'GitHub',
        email: 'noreply@github.com',
      },
    },
    repository: {
      id: 1296269,
      node_id: 'MDEwOlJlcG9zaXRvcnkxMjk2MjY5',
      name: 'Hello-World',
      full_name: 'octocat/Hello-World',
      owner: {
        login: 'octocat',
        id: 1,
        node_id: 'MDQ6VXNlcjE=',
        avatar_url: 'https://github.com/images/error/octocat_happy.gif',
        gravatar_id: '',
        url: 'https://api.github.com/users/octocat',
        html_url: 'https://github.com/octocat',
        followers_url: 'https://api.github.com/users/octocat/followers',
        following_url: 'https://api.github.com/users/octocat/following{/other_user}',
        gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
        starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
        organizations_url: 'https://api.github.com/users/octocat/orgs',
        repos_url: 'https://api.github.com/users/octocat/repos',
        events_url: 'https://api.github.com/users/octocat/events{/privacy}',
        received_events_url: 'https://api.github.com/users/octocat/received_events',
        type: 'User',
        site_admin: false,
      },
      private: false,
      html_url: 'https://github.com/octocat/Hello-World',
      description: 'This your first repo!',
      fork: false,
      url: 'https://api.github.com/repos/octocat/Hello-World',
      archive_url: 'https://api.github.com/repos/octocat/Hello-World/{archive_format}{/ref}',
      assignees_url: 'https://api.github.com/repos/octocat/Hello-World/assignees{/user}',
      blobs_url: 'https://api.github.com/repos/octocat/Hello-World/git/blobs{/sha}',
      branches_url: 'https://api.github.com/repos/octocat/Hello-World/branches{/branch}',
      collaborators_url: 'https://api.github.com/repos/octocat/Hello-World/collaborators{/collaborator}',
      comments_url: 'https://api.github.com/repos/octocat/Hello-World/comments{/number}',
      commits_url: 'https://api.github.com/repos/octocat/Hello-World/commits{/sha}',
      compare_url: 'https://api.github.com/repos/octocat/Hello-World/compare/{base}...{head}',
      contents_url: 'https://api.github.com/repos/octocat/Hello-World/contents/{+path}',
      contributors_url: 'https://api.github.com/repos/octocat/Hello-World/contributors',
      deployments_url: 'https://api.github.com/repos/octocat/Hello-World/deployments',
      downloads_url: 'https://api.github.com/repos/octocat/Hello-World/downloads',
      events_url: 'https://api.github.com/repos/octocat/Hello-World/events',
      forks_url: 'https://api.github.com/repos/octocat/Hello-World/forks',
      git_commits_url: 'https://api.github.com/repos/octocat/Hello-World/git/commits{/sha}',
      git_refs_url: 'https://api.github.com/repos/octocat/Hello-World/git/refs{/sha}',
      git_tags_url: 'https://api.github.com/repos/octocat/Hello-World/git/tags{/sha}',
      issue_comment_url: 'https://api.github.com/repos/octocat/Hello-World/issues/comments{/number}',
      issue_events_url: 'https://api.github.com/repos/octocat/Hello-World/issues/events{/number}',
      issues_url: 'https://api.github.com/repos/octocat/Hello-World/issues{/number}',
      keys_url: 'https://api.github.com/repos/octocat/Hello-World/keys{/key_id}',
      labels_url: 'https://api.github.com/repos/octocat/Hello-World/labels{/name}',
      languages_url: 'https://api.github.com/repos/octocat/Hello-World/languages',
      merges_url: 'https://api.github.com/repos/octocat/Hello-World/merges',
      milestones_url: 'https://api.github.com/repos/octocat/Hello-World/milestones{/number}',
      notifications_url: 'https://api.github.com/repos/octocat/Hello-World/notifications{?since,all,participating}',
      pulls_url: 'https://api.github.com/repos/octocat/Hello-World/pulls{/number}',
      releases_url: 'https://api.github.com/repos/octocat/Hello-World/releases{/id}',
      stargazers_url: 'https://api.github.com/repos/octocat/Hello-World/stargazers',
      statuses_url: 'https://api.github.com/repos/octocat/Hello-World/statuses/{sha}',
      subscribers_url: 'https://api.github.com/repos/octocat/Hello-World/subscribers',
      subscription_url: 'https://api.github.com/repos/octocat/Hello-World/subscription',
      tags_url: 'https://api.github.com/repos/octocat/Hello-World/tags',
      teams_url: 'https://api.github.com/repos/octocat/Hello-World/teams',
      trees_url: 'https://api.github.com/repos/octocat/Hello-World/git/trees{/sha}',
      hooks_url: 'http://api.github.com/repos/octocat/Hello-World/hooks',
    },
    head_repository: {
      id: 217723378,
      node_id: 'MDEwOlJlcG9zaXRvcnkyMTc3MjMzNzg=',
      name: 'octo-repo',
      full_name: 'octo-org/octo-repo',
      private: true,
      owner: {
        login: 'octocat',
        id: 1,
        node_id: 'MDQ6VXNlcjE=',
        avatar_url: 'https://github.com/images/error/octocat_happy.gif',
        gravatar_id: '',
        url: 'https://api.github.com/users/octocat',
        html_url: 'https://github.com/octocat',
        followers_url: 'https://api.github.com/users/octocat/followers',
        following_url: 'https://api.github.com/users/octocat/following{/other_user}',
        gists_url: 'https://api.github.com/users/octocat/gists{/gist_id}',
        starred_url: 'https://api.github.com/users/octocat/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/octocat/subscriptions',
        organizations_url: 'https://api.github.com/users/octocat/orgs',
        repos_url: 'https://api.github.com/users/octocat/repos',
        events_url: 'https://api.github.com/users/octocat/events{/privacy}',
        received_events_url: 'https://api.github.com/users/octocat/received_events',
        type: 'User',
        site_admin: false,
      },
      html_url: 'https://github.com/octo-org/octo-repo',
      description: null,
      fork: false,
      url: 'https://api.github.com/repos/octo-org/octo-repo',
      forks_url: 'https://api.github.com/repos/octo-org/octo-repo/forks',
      keys_url: 'https://api.github.com/repos/octo-org/octo-repo/keys{/key_id}',
      collaborators_url: 'https://api.github.com/repos/octo-org/octo-repo/collaborators{/collaborator}',
      teams_url: 'https://api.github.com/repos/octo-org/octo-repo/teams',
      hooks_url: 'https://api.github.com/repos/octo-org/octo-repo/hooks',
      issue_events_url: 'https://api.github.com/repos/octo-org/octo-repo/issues/events{/number}',
      events_url: 'https://api.github.com/repos/octo-org/octo-repo/events',
      assignees_url: 'https://api.github.com/repos/octo-org/octo-repo/assignees{/user}',
      branches_url: 'https://api.github.com/repos/octo-org/octo-repo/branches{/branch}',
      tags_url: 'https://api.github.com/repos/octo-org/octo-repo/tags',
      blobs_url: 'https://api.github.com/repos/octo-org/octo-repo/git/blobs{/sha}',
      git_tags_url: 'https://api.github.com/repos/octo-org/octo-repo/git/tags{/sha}',
      git_refs_url: 'https://api.github.com/repos/octo-org/octo-repo/git/refs{/sha}',
      trees_url: 'https://api.github.com/repos/octo-org/octo-repo/git/trees{/sha}',
      statuses_url: 'https://api.github.com/repos/octo-org/octo-repo/statuses/{sha}',
      languages_url: 'https://api.github.com/repos/octo-org/octo-repo/languages',
      stargazers_url: 'https://api.github.com/repos/octo-org/octo-repo/stargazers',
      contributors_url: 'https://api.github.com/repos/octo-org/octo-repo/contributors',
      subscribers_url: 'https://api.github.com/repos/octo-org/octo-repo/subscribers',
      subscription_url: 'https://api.github.com/repos/octo-org/octo-repo/subscription',
      commits_url: 'https://api.github.com/repos/octo-org/octo-repo/commits{/sha}',
      git_commits_url: 'https://api.github.com/repos/octo-org/octo-repo/git/commits{/sha}',
      comments_url: 'https://api.github.com/repos/octo-org/octo-repo/comments{/number}',
      issue_comment_url: 'https://api.github.com/repos/octo-org/octo-repo/issues/comments{/number}',
      contents_url: 'https://api.github.com/repos/octo-org/octo-repo/contents/{+path}',
      compare_url: 'https://api.github.com/repos/octo-org/octo-repo/compare/{base}...{head}',
      merges_url: 'https://api.github.com/repos/octo-org/octo-repo/merges',
      archive_url: 'https://api.github.com/repos/octo-org/octo-repo/{archive_format}{/ref}',
      downloads_url: 'https://api.github.com/repos/octo-org/octo-repo/downloads',
      issues_url: 'https://api.github.com/repos/octo-org/octo-repo/issues{/number}',
      pulls_url: 'https://api.github.com/repos/octo-org/octo-repo/pulls{/number}',
      milestones_url: 'https://api.github.com/repos/octo-org/octo-repo/milestones{/number}',
      notifications_url: 'https://api.github.com/repos/octo-org/octo-repo/notifications{?since,all,participating}',
      labels_url: 'https://api.github.com/repos/octo-org/octo-repo/labels{/name}',
      releases_url: 'https://api.github.com/repos/octo-org/octo-repo/releases{/id}',
      deployments_url: 'https://api.github.com/repos/octo-org/octo-repo/deployments',
    },
  },

  // https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#workflow_run
  action: 'completed',
  organization: {
    avatar_url: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
    description: '',
    events_url: 'https://api.github.com/orgs/Octocoders/events',
    hooks_url: 'https://api.github.com/orgs/Octocoders/hooks',
    id: 33435682,
    issues_url: 'https://api.github.com/orgs/Octocoders/issues',
    login: 'Codertocat',
    members_url: 'https://api.github.com/orgs/Octocoders/members{/member}',
    node_id: 'MDQ6VXNlcjIxMDMxMDY3',
    public_members_url: 'https://api.github.com/orgs/Octocoders/public_members{/member}',
    repos_url: 'https://api.github.com/orgs/Octocoders/repos',
    url: 'https://api.github.com/orgs/Codertocat',
  },
  repository: {
    topics: [],
    visibility: 'public',
    web_commit_signoff_required: false,
    archive_url: 'https://api.github.com/repos/Codertocat/Hello-World/{archive_format}{/ref}',
    archived: false,
    assignees_url: 'https://api.github.com/repos/Codertocat/Hello-World/assignees{/user}',
    blobs_url: 'https://api.github.com/repos/Codertocat/Hello-World/git/blobs{/sha}',
    branches_url: 'https://api.github.com/repos/Codertocat/Hello-World/branches{/branch}',
    clone_url: 'https://github.com/Codertocat/Hello-World.git',
    collaborators_url: 'https://api.github.com/repos/Codertocat/Hello-World/collaborators{/collaborator}',
    comments_url: 'https://api.github.com/repos/Codertocat/Hello-World/comments{/number}',
    commits_url: 'https://api.github.com/repos/Codertocat/Hello-World/commits{/sha}',
    compare_url: 'https://api.github.com/repos/Codertocat/Hello-World/compare/{base}...{head}',
    contents_url: 'https://api.github.com/repos/Codertocat/Hello-World/contents/{+path}',
    contributors_url: 'https://api.github.com/repos/Codertocat/Hello-World/contributors',
    created_at: '2020-07-29T09:57:16Z',
    default_branch: 'main',
    deployments_url: 'https://api.github.com/repos/Codertocat/Hello-World/deployments',
    description: null,
    disabled: false,
    downloads_url: 'https://api.github.com/repos/Codertocat/Hello-World/downloads',
    events_url: 'https://api.github.com/repos/Codertocat/Hello-World/events',
    fork: false,
    forks: 0,
    forks_count: 0,
    forks_url: 'https://api.github.com/repos/Codertocat/Hello-World/forks',
    full_name: 'Codertocat/Hello-World',
    git_commits_url: 'https://api.github.com/repos/Codertocat/Hello-World/git/commits{/sha}',
    git_refs_url: 'https://api.github.com/repos/Codertocat/Hello-World/git/refs{/sha}',
    git_tags_url: 'https://api.github.com/repos/Codertocat/Hello-World/git/tags{/sha}',
    git_url: 'git://github.com/Codertocat/Hello-World.git',
    has_downloads: true,
    has_issues: true,
    has_pages: false,
    has_projects: true,
    has_wiki: true,
    homepage: null,
    hooks_url: 'https://api.github.com/repos/Codertocat/Hello-World/hooks',
    html_url: 'https://github.com/Codertocat/Hello-World',
    id: 283462325,
    is_template: false,
    issue_comment_url: 'https://api.github.com/repos/Codertocat/Hello-World/issues/comments{/number}',
    issue_events_url: 'https://api.github.com/repos/Codertocat/Hello-World/issues/events{/number}',
    issues_url: 'https://api.github.com/repos/Codertocat/Hello-World/issues{/number}',
    keys_url: 'https://api.github.com/repos/Codertocat/Hello-World/keys{/key_id}',
    labels_url: 'https://api.github.com/repos/Codertocat/Hello-World/labels{/name}',
    language: null,
    languages_url: 'https://api.github.com/repos/Codertocat/Hello-World/languages',
    license: null,
    merges_url: 'https://api.github.com/repos/Codertocat/Hello-World/merges',
    milestones_url: 'https://api.github.com/repos/Codertocat/Hello-World/milestones{/number}',
    mirror_url: null,
    name: 'Hello-World',
    node_id: 'MDEwOlJlcG9zaXRvcnkyODM0NjIzMjU=',
    notifications_url: 'https://api.github.com/repos/Codertocat/Hello-World/notifications{?since,all,participating}',
    open_issues: 0,
    open_issues_count: 0,
    owner: {
      avatar_url: 'https://avatars1.githubusercontent.com/u/21031067?v=4',
      events_url: 'https://api.github.com/users/Codertocat/events{/privacy}',
      followers_url: 'https://api.github.com/users/Codertocat/followers',
      following_url: 'https://api.github.com/users/Codertocat/following{/other_user}',
      gists_url: 'https://api.github.com/users/Codertocat/gists{/gist_id}',
      gravatar_id: '',
      html_url: 'https://github.com/Codertocat',
      id: 33435682,
      login: 'Codertocat',
      node_id: 'MDEyOk9yZ2FuaXphdGlvbjMzNDM1Njgy',
      organizations_url: 'https://api.github.com/users/Codertocat/orgs',
      received_events_url: 'https://api.github.com/users/Codertocat/received_events',
      repos_url: 'https://api.github.com/users/Codertocat/repos',
      site_admin: false,
      starred_url: 'https://api.github.com/users/Codertocat/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/Codertocat/subscriptions',
      type: 'Organization',
      url: 'https://api.github.com/users/Codertocat',
    },
    private: true,
    pulls_url: 'https://api.github.com/repos/Codertocat/Hello-World/pulls{/number}',
    pushed_at: '2020-07-29T10:06:16Z',
    releases_url: 'https://api.github.com/repos/Codertocat/Hello-World/releases{/id}',
    size: 0,
    ssh_url: 'git@github.com:Codertocat/Hello-World.git',
    stargazers_count: 0,
    stargazers_url: 'https://api.github.com/repos/Codertocat/Hello-World/stargazers',
    statuses_url: 'https://api.github.com/repos/Codertocat/Hello-World/statuses/{sha}',
    subscribers_url: 'https://api.github.com/repos/Codertocat/Hello-World/subscribers',
    subscription_url: 'https://api.github.com/repos/Codertocat/Hello-World/subscription',
    svn_url: 'https://github.com/Codertocat/Hello-World',
    tags_url: 'https://api.github.com/repos/Codertocat/Hello-World/tags',
    teams_url: 'https://api.github.com/repos/Codertocat/Hello-World/teams',
    trees_url: 'https://api.github.com/repos/Codertocat/Hello-World/git/trees{/sha}',
    updated_at: '2020-07-29T10:06:18Z',
    url: 'https://api.github.com/repos/Codertocat/Hello-World',
    watchers: 0,
    watchers_count: 0,
  },
  sender: {
    avatar_url: 'https://avatars3.githubusercontent.com/u/54248166?v=4',
    events_url: 'https://api.github.com/users/Codertocat/events{/privacy}',
    followers_url: 'https://api.github.com/users/Codertocat/followers',
    following_url: 'https://api.github.com/users/Codertocat/following{/other_user}',
    gists_url: 'https://api.github.com/users/Codertocat/gists{/gist_id}',
    gravatar_id: '',
    html_url: 'https://github.com/Codertocat',
    id: 54248166,
    login: 'Codertocat',
    node_id: 'MDEwOkNoZWNrU3VpdGUxMTg1NzgxNDc=',
    organizations_url: 'https://api.github.com/users/Codertocat/orgs',
    received_events_url: 'https://api.github.com/users/Codertocat/received_events',
    repos_url: 'https://api.github.com/users/Codertocat/repos',
    site_admin: true,
    starred_url: 'https://api.github.com/users/Codertocat/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/Codertocat/subscriptions',
    type: 'User',
    url: 'https://api.github.com/users/Codertocat',
  },
}
