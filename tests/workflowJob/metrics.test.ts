import { describe, it, expect } from 'vitest'
import { computeWorkflowJobMetrics } from '../../src/workflowJob/metrics.js'
import { WorkflowJobCompletedEvent } from '@octokit/webhooks-types'
import { WorkflowRun } from '../../src/workflowJob/queries.js'

// Use simplified mock data, only including fields needed for testing
const mockWorkflowJobCompletedEvent = {
  action: 'completed' as const,
  workflow_job: {
    id: 123456,
    run_id: 987654,
    run_url: 'https://api.github.com/repos/owner/repo/actions/runs/987654',
    node_id: 'CR_kwDOG',
    head_sha: 'abc123',
    url: 'https://api.github.com/repos/owner/repo/actions/jobs/123456',
    html_url: 'https://github.com/owner/repo/runs/123456',
    status: 'completed' as const,
    conclusion: 'success' as const,
    created_at: '2023-01-01T09:58:00Z',
    started_at: '2023-01-01T10:00:00Z',
    completed_at: '2023-01-01T10:05:00Z',
    name: 'test-job',
    steps: [],
    check_run_url: 'https://api.github.com/repos/owner/repo/check-runs/123456',
    labels: ['ubuntu-latest'],
    runner_id: 1,
    runner_name: 'GitHub Actions 1',
    runner_group_id: 1,
    runner_group_name: 'GitHub Actions',
    workflow_name: 'Test Workflow',
    head_branch: 'main',
  },
  repository: {
    id: 123456789,
    node_id: 'R_kgDOG',
    name: 'repo',
    full_name: 'owner/repo',
    private: false,
    owner: {
      login: 'owner',
      id: 123456,
      node_id: 'MDQ6VXNlcjEyMzQ1Ng==',
      avatar_url: 'https://github.com/images/error/octocat_happy.gif',
      gravatar_id: '',
      url: 'https://api.github.com/users/owner',
      html_url: 'https://github.com/owner',
      followers_url: 'https://api.github.com/users/owner/followers',
      following_url: 'https://api.github.com/users/owner/following{/other_user}',
      gists_url: 'https://api.github.com/users/owner/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/owner/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/owner/subscriptions',
      organizations_url: 'https://api.github.com/users/owner/orgs',
      repos_url: 'https://api.github.com/users/owner/repos',
      events_url: 'https://api.github.com/users/owner/events{/privacy}',
      received_events_url: 'https://api.github.com/users/owner/received_events',
      type: 'User' as const,
      site_admin: false,
    },
    html_url: 'https://github.com/owner/repo',
    description: null,
    fork: false,
    url: 'https://api.github.com/repos/owner/repo',
    forks_url: 'https://api.github.com/repos/owner/repo/forks',
    keys_url: 'https://api.github.com/repos/owner/repo/keys{/key_id}',
    collaborators_url: 'https://api.github.com/repos/owner/repo/collaborators{/collaborator}',
    teams_url: 'https://api.github.com/repos/owner/repo/teams',
    hooks_url: 'https://api.github.com/repos/owner/repo/hooks',
    issue_events_url: 'https://api.github.com/repos/owner/repo/issues/events{/number}',
    events_url: 'https://api.github.com/repos/owner/repo/events',
    assignees_url: 'https://api.github.com/repos/owner/repo/assignees{/user}',
    branches_url: 'https://api.github.com/repos/owner/repo/branches{/branch}',
    tags_url: 'https://api.github.com/repos/owner/repo/tags',
    blobs_url: 'https://api.github.com/repos/owner/repo/git/blobs{/sha}',
    git_tags_url: 'https://api.github.com/repos/owner/repo/git/tags{/sha}',
    git_refs_url: 'https://api.github.com/repos/owner/repo/git/refs{/sha}',
    trees_url: 'https://api.github.com/repos/owner/repo/git/trees{/sha}',
    statuses_url: 'https://api.github.com/repos/owner/repo/statuses/{sha}',
    languages_url: 'https://api.github.com/repos/owner/repo/languages',
    stargazers_url: 'https://github.com/owner/repo/stargazers',
    contributors_url: 'https://api.github.com/repos/owner/repo/contributors',
    subscribers_url: 'https://api.github.com/repos/owner/repo/subscribers',
    subscription_url: 'https://api.github.com/repos/owner/repo/subscription',
    commits_url: 'https://api.github.com/repos/owner/repo/commits{/sha}',
    git_commits_url: 'https://api.github.com/repos/owner/repo/git/commits{/sha}',
    comments_url: 'https://api.github.com/repos/owner/repo/comments{/number}',
    issue_comment_url: 'https://api.github.com/repos/owner/repo/issues/comments{/number}',
    contents_url: 'https://api.github.com/repos/owner/repo/contents/{+path}',
    compare_url: 'https://api.github.com/repos/owner/repo/compare/{base}...{head}',
    merges_url: 'https://api.github.com/repos/owner/repo/merges',
    archive_url: 'https://api.github.com/repos/owner/repo/{archive_format}{/ref}',
    downloads_url: 'https://api.github.com/repos/owner/repo/downloads',
    questions_url: 'https://api.github.com/repos/owner/repo/questions',
    pulls_url: 'https://api.github.com/repos/owner/repo/pulls{/number}',
    milestones_url: 'https://api.github.com/repos/owner/repo/milestones{/number}',
    notifications_url: 'https://api.github.com/repos/owner/repo/notifications{?since,all,participating}',
    labels_url: 'https://api.github.com/repos/owner/repo/labels{/name}',
    releases_url: 'https://api.github.com/repos/owner/repo/releases{/id}',
    deployments_url: 'https://api.github.com/repos/owner/repo/deployments',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    pushed_at: '2023-01-01T00:00:00Z',
    git_url: 'git://github.com/owner/repo.git',
    ssh_url: 'git@github.com:owner/repo.git',
    clone_url: 'https://github.com/owner/repo.git',
    svn_url: 'https://github.com/owner/repo',
    homepage: null,
    size: 0,
    stargazers_count: 0,
    watchers_count: 0,
    language: null,
    has_issues: true,
    has_projects: true,
    has_downloads: true,
    has_wiki: true,
    has_pages: false,
    forks_count: 0,
    mirror_url: null,
    archived: false,
    disabled: false,
    forks: 0,
    open_issues: 0,
    license: null,
    allow_forking: true,
    is_template: false,
    web_commit_signoff_required: false,
    topics: [],
    visibility: 'public' as const,
    default_branch: 'main',
    watchers: 0,
  },
  sender: {
    login: 'github-actions[bot]',
    id: 41898282,
    node_id: 'MDM6Qm90NDE4OTgyODI=',
    avatar_url: 'https://avatars.githubusercontent.com/in/15368?v=4',
    gravatar_id: '',
    url: 'https://api.github.com/users/github-actions%5Bbot%5D',
    html_url: 'https://github.com/apps/github-actions',
    followers_url: 'https://api.github.com/users/github-actions%5Bbot%5D/followers',
    following_url: 'https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}',
    gists_url: 'https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}',
    starred_url: 'https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}',
    subscriptions_url: 'https://api.github.com/users/github-actions%5Bbot%5D/subscriptions',
    organizations_url: 'https://api.github.com/users/github-actions%5Bbot%5D/orgs',
    repos_url: 'https://api.github.com/users/github-actions%5Bbot%5D/repos',
    events_url: 'https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}',
    received_events_url: 'https://api.github.com/users/github-actions%5Bbot%5D/received_events',
    type: 'Bot' as const,
    site_admin: false,
  },
} as unknown as WorkflowJobCompletedEvent

const mockWorkflowRun: WorkflowRun = {
  id: 987654,
  name: 'Test Workflow',
  run_attempt: 1,
  event: 'push',
  run_started_at: '2023-01-01T09:58:00Z',
  head_branch: 'main',
  pull_requests: [],
}

describe('computeWorkflowJobMetrics', () => {
  it('should compute job metrics for a completed workflow job', () => {
    const result = computeWorkflowJobMetrics(mockWorkflowJobCompletedEvent, mockWorkflowRun, {
      preferDistributionJobMetrics: false,
    })

    expect(result.series).toHaveLength(4) // job.total, job.conclusion.success_total, job.duration_second, job.start_time_from_workflow_start_second
    expect(result.distributionPointsSeries).toHaveLength(0)

    // Check job total metric
    const jobTotalMetric = result.series.find((s) => s.metric === 'github.actions.job.total')
    expect(jobTotalMetric).toBeDefined()
    expect(jobTotalMetric?.tags).toContain('job_name:test-job')
    expect(jobTotalMetric?.tags).toContain('conclusion:success')
    expect(jobTotalMetric?.tags).toContain('repository_owner:owner')
    expect(jobTotalMetric?.tags).toContain('repository_name:repo')
    expect(jobTotalMetric?.tags).toContain('runs_on:ubuntu-latest')

    // Check job conclusion metric
    const jobConclusionMetric = result.series.find((s) => s.metric === 'github.actions.job.conclusion.success_total')
    expect(jobConclusionMetric).toBeDefined()
    expect(jobConclusionMetric?.tags).toContain('conclusion:success')

    // Check job duration metric
    const jobDurationMetric = result.series.find((s) => s.metric === 'github.actions.job.duration_second')
    expect(jobDurationMetric).toBeDefined()
    expect(jobDurationMetric?.type).toBe('gauge')
    expect(jobDurationMetric?.points[0][1]).toBe(300) // 5 minutes = 300 seconds
  })

  it('should compute distribution metrics when preferred', () => {
    const result = computeWorkflowJobMetrics(mockWorkflowJobCompletedEvent, mockWorkflowRun, {
      preferDistributionJobMetrics: true,
    })

    expect(result.series).toHaveLength(2) // job.total, job.conclusion.success_total
    expect(result.distributionPointsSeries).toHaveLength(2) // job.duration_second.distribution, job.start_time_from_workflow_start_second.distribution

    // Check distribution metrics
    const durationDistribution = result.distributionPointsSeries.find(
      (s) => s.metric === 'github.actions.job.duration_second.distribution',
    )
    expect(durationDistribution).toBeDefined()
    expect(durationDistribution?.points[0][1]).toEqual([300]) // 5 minutes = 300 seconds
  })

  it('should handle workflow job without start time', () => {
    const eventWithoutStartTime = {
      ...mockWorkflowJobCompletedEvent,
      workflow_job: {
        ...mockWorkflowJobCompletedEvent.workflow_job,
        started_at: undefined,
      },
    } as unknown as WorkflowJobCompletedEvent

    const result = computeWorkflowJobMetrics(eventWithoutStartTime, mockWorkflowRun, {
      preferDistributionJobMetrics: false,
    })

    expect(result.series).toHaveLength(2) // Only job.total and job.conclusion.success_total
    expect(result.distributionPointsSeries).toHaveLength(0)
  })
})
