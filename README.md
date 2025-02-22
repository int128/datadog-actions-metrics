# datadog-actions-metrics [![ts](https://github.com/int128/datadog-actions-metrics/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/datadog-actions-metrics/actions/workflows/ts.yaml) [![e2e](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml/badge.svg)](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml)

This is an action to send metrics of GitHub Actions to Datadog on an event.
It is inspired from [yuya-takeyama/github-actions-metrics-to-datadog-action](https://github.com/yuya-takeyama/github-actions-metrics-to-datadog-action).

## Purpose

### Improve the reliability and experience of CI/CD pipeline

To collect the metrics when a workflow run is completed:

```yaml
on:
  workflow_run:
    workflows:
      - '**'
    types:
      - completed

jobs:
  send:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: int128/datadog-actions-metrics@v1
        with:
          # create an API key in https://docs.datadoghq.com/account_management/api-app-keys/
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
```

For the developer experience, you can analyze the following metrics:

- Time to test an application
- Time to build and deploy an application

For the reliability, you can monitor the following metrics:

- Success rate of the default branch
- Rate limit of built-in `GITHUB_TOKEN`

Here is an example of screenshot in Datadog.

<img width="1342" alt="image" src="https://github.com/int128/datadog-actions-metrics/assets/321266/99e813d7-8f42-4896-aba5-c66fe6b84a53">

### Improve the reliability and experience of self-hosted runners

For the self-hosted runners, you can monitor the following metrics for reliability and experience:

- Queued time of a job
- Count of the [lost communication with the server](https://github.com/actions-runner-controller/actions-runner-controller/issues/466) errors

Here is an example of screenshot in Datadog.

<img width="562" alt="image" src="https://github.com/int128/datadog-actions-metrics/assets/321266/0baba537-a5f2-4a66-98b6-e3f372f5871d">

### Improve your team development process

You can analyze your development activity such as number of merged pull requests.
It helps the continuous process improvement of your team.

To collect the metrics when a pull request is opened, closed or merged into main:

```yaml
on:
  pull_request:
    types:
      - opened
      - closed
  push:
    branches:
      - main

jobs:
  send:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: int128/datadog-actions-metrics@v1
        with:
          # create an API key in https://docs.datadoghq.com/account_management/api-app-keys/
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
```

## Overview

This action can handle the following events:

- workflow_run event
- pull_request event
- push event
- schedule event

Other events are ignored.

## Metrics for workflow_run event

### Workflow run

This action sends the following metrics.

- `github.actions.workflow_run.total`
  - Total workflow runs (count)
- `github.actions.workflow_run.conclusion.{CONCLUSION}_total`
  - Total workflow runs by the conclusion (count).
    See [the official document](https://docs.github.com/en/rest/reference/checks#create-a-check-run) for the possible values of `CONCLUSION` field
  - e.g. `github.actions.workflow_run.conclusion.success_total`
  - e.g. `github.actions.workflow_run.conclusion.failure_total`
- `github.actions.workflow_run.duration_second`
- `github.actions.workflow_run.duration_second.distribution`
  - Time from a workflow run is started until it is updated (gauge or distribution)

It has the following tags:

- `repository_owner`
- `repository_name`
- `workflow_name`
- `workflow_id`
- `run_attempt`
  - Attempt number of the run, 1 for first attempt and higher if the workflow was re-run
- `event`
- `sender`
- `sender_type` = either `Bot`, `User` or `Organization`
- `branch`
- `default_branch` = `true` or `false`
- `pull_request_number`
  - Pull request(s) which triggered the workflow
- `conclusion`

See also the actual metrics in the [E2E test](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml).

### Job

This action sends the following metrics if `collect-job-metrics` is enabled.

- `github.actions.job.total`
  - Total jobs (count)
- `github.actions.job.conclusion.{CONCLUSION}_total`
  - Total jobs by the conclusion (count)
  - e.g. `github.actions.job.conclusion.success_total`
  - e.g. `github.actions.job.conclusion.failure_total`
- `github.actions.job.queued_duration_second`
- `github.actions.job.queued_duration_second.distribution`
  - Time from a job is created to started (gauge or distribution)
- `github.actions.job.duration_second`
- `github.actions.job.duration_second.distribution`
  - Time from a job is started to completed (gauge or distribution)
- `github.actions.job.start_time_from_workflow_start_second`
- `github.actions.job.start_time_from_workflow_start_second.distribution`
  - Time from the workflow run is started until a job is started (gauge or distribution)
- `github.actions.job.lost_communication_with_server_error_total`
  - Count of "lost communication with the server" errors of self-hosted runners.
    See the issue [#444](https://github.com/int128/datadog-actions-metrics/issues/444) for details
- `github.actions.job.received_shutdown_signal_error_total`
  - Count of "The runner has received a shutdown signal" errors of self-hosted runners.

It has the following tags:

- `repository_owner`
- `repository_name`
- `workflow_name`
- `workflow_id`
- `event`
- `sender`
- `sender_type` = either `Bot`, `User` or `Organization`
- `branch`
- `default_branch` = `true` or `false`
- `pull_request_number`
  - Pull request(s) which triggered the workflow
- `job_name`
- `job_id`
- `conclusion`
- `status`
- `runs_on`
  - Runner label inferred from the workflow file if available
  - e.g. `ubuntu-latest`

### Step

This action sends the following metrics if `collect-step-metrics` is enabled.

- `github.actions.step.total`
  - Total steps (count)
- `github.actions.step.conclusion.{CONCLUSION}_total`
  - Total steps by the conclusion (count)
  - e.g. `github.actions.step.conclusion.success_total`
  - e.g. `github.actions.step.conclusion.failure_total`
- `github.actions.step.duration_second`
- `github.actions.step.duration_second.distribution`
  - Time from a step is started until completed (gauge or distribution)
- `github.actions.step.start_time_from_workflow_start_second`
- `github.actions.step.start_time_from_workflow_start_second.distribution`
  - Time from the workflow run is started until a step is started (gauge or distribution)

It has the following tags:

- `repository_owner`
- `repository_name`
- `workflow_name`
- `workflow_id`
- `event`
- `sender`
- `sender_type` = either `Bot`, `User` or `Organization`
- `branch`
- `default_branch` = `true` or `false`
- `pull_request_number`
  - Pull request(s) which triggered the workflow
- `job_name`
- `job_id`
- `step_name`
- `step_number` = 1, 2, ...
- `conclusion`
- `status`
- `runs_on`
  - Runner label inferred from the workflow file if available
  - e.g. `ubuntu-latest`

### Enable job or step metrics

To send the metrics of jobs and steps:

```yaml
steps:
  - uses: int128/datadog-actions-metrics@v1
    with:
      datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
      collect-job-metrics: true
      collect-step-metrics: true
```

To send the metrics of jobs and steps on the default branch only:

```yaml
steps:
  - uses: int128/datadog-actions-metrics@v1
    with:
      datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
      collect-job-metrics: ${{ github.event.workflow_run.head_branch == github.event.repository.default_branch }}
      collect-step-metrics: ${{ github.event.workflow_run.head_branch == github.event.repository.default_branch }}
```

This action calls GitHub REST API and GraphQL API to get jobs and steps of the current workflow run.
Note that it may cause the rate exceeding error when too many workflows are run.

If the job or step metrics is enabled, this action requires the following permissions:

```yaml
permissions:
  actions: read
  checks: read
  contents: read
```

### Prefer distribution metrics

This action sends the gauge metrics by default.
To send the distribution metrics instead of the gauge metrics,

```yaml
steps:
  - uses: int128/datadog-actions-metrics@v1
    with:
      datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
      prefer-distribution-workflow-run-metrics: true
      collect-job-metrics: true
      collect-step-metrics: true
      prefer-distribution-job-metrics: true
      prefer-distribution-step-metrics: true
```

Note that the distribution metrics may increase the custom metrics cost.

## Metrics for pull_request event

### Pull request (opened)

This action sends the following metrics on `opened` type.

- `github.actions.pull_request_opened.total`
  - Total opened events (count)
- `github.actions.pull_request_opened.commits`
  - Number of commits in a pull request (count)
- `github.actions.pull_request_opened.changed_files`
  - Number of changed files in a pull request (count)
- `github.actions.pull_request_opened.additions`
  - Number of added lines in a pull request (count)
- `github.actions.pull_request_opened.deletions`
  - Number of deleted lines in a pull request (count)

It has the following tags:

- `repository_owner`
- `repository_name`
- `sender`
- `sender_type` = either `Bot`, `User` or `Organization`
- `user`
- `pull_request_number`
- `draft` = `true` or `false`
- `base_ref`
- `head_ref`

### Pull request (closed)

This action sends the following metrics on `closed` type.

- `github.actions.pull_request_closed.total`
  - Total closed events (count)
- `github.actions.pull_request_closed.since_opened_seconds`
  - Time from a pull request is opened to closed (gauge)
- `github.actions.pull_request_closed.since_first_authored_seconds`
  - Time from the authored time of the first commit until closed (gauge)
- `github.actions.pull_request_closed.since_first_committed_seconds`
  - Time from the committed time of the first commit until closed (gauge)
- `github.actions.pull_request_closed.commits`
  - Number of commits in a pull request (count)
- `github.actions.pull_request_closed.changed_files`
  - Number of changed files in a pull request (count)
- `github.actions.pull_request_closed.additions`
  - Number of added lines in a pull request (count)
- `github.actions.pull_request_closed.deletions`
  - Number of deleted lines in a pull request (count)

It has the following tags:

- `repository_owner`
- `repository_name`
- `sender`
- `sender_type` = either `Bot`, `User` or `Organization`
- `user`
- `pull_request_number`
- `draft` = `true` or `false`
- `base_ref`
- `head_ref`
- `merged` = `true` or `false`
- `requested_team`
  - Team(s) of requested reviewer(s)
- `label`
  - Label(s) of a pull request
  - Available if `send-pull-request-labels` is set

### Permissions

For pull_request event, this action requires the following permissions:

```yaml
permissions:
  pull-requests: read
```

## Metrics for push event

This action sends the following metrics.

- `github.actions.push.total`
  - Total push events (count)

It has the following tags:

- `repository_owner`
- `repository_name`
- `sender`
- `sender_type` = either `Bot`, `User` or `Organization`
- `ref`
- `created` = `true` or `false`
- `deleted` = `true` or `false`
- `forced` = `true` or `false`
- `default_branch` = `true` or `false`

## Metrics for schedule event

### Workflow run

This action sends the following metrics:

- `github.actions.schedule.queued_workflow_run.total`
  - Number of queued workflow runs (gauge)

It has the following tags:

- `repository_owner`
- `repository_name`

It is useful for monitoring self-hosted runners.

### Permissions

For schedule event, this action requires the following permissions:

```yaml
permissions:
  actions: read
```

## Metrics for all supported events

### Rate limit

This action always sends the following metrics of [the built-in `GITHUB_TOKEN` rate limit](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

- `github.actions.api_rate_limit.remaining`
  - Remaining requests of GitHub API (gauge)
- `github.actions.api_rate_limit.limit`
  - Limit of requests of GitHub API (gauge)

It has the following tags:

- `repository_owner`
- `repository_name`
- `resource` = `core`, `search` and `graphql`

This does not affect the rate limit of GitHub API because it just calls [`/rate_limit` endpoint](https://docs.github.com/en/rest/reference/rate-limit).

## Specification

You can set the following inputs:

| Name                                       | Default        | Description                                                                     |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------------- |
| `github-token`                             | `github.token` | GitHub token to get jobs and steps if needed                                    |
| `github-token-rate-limit-metrics`          | `github.token` | GitHub token for rate limit metrics                                             |
| `datadog-api-key`                          | -              | Datadog API key. If not set, this action does not send metrics actually         |
| `datadog-site`                             | -              | Datadog Server name such as `datadoghq.eu`, `ddog-gov.com`, `us3.datadoghq.com` |
| `datadog-tags`                             | -              | Additional tags in the form of `key:value` in a multiline string                |
| `metrics-patterns`                         | -              | Filter the metrics by patterns in a multiline string                            |
| `tags-to-exclude`                          | -              | Exclude specified tags by names in a multiline string                           |
| `send-pull-request-labels`                 | `false`        | Send pull request labels as Datadog tags                                        |
| `collect-job-metrics`                      | `false`        | Collect job metrics                                                             |
| `collect-step-metrics`                     | `false`        | Collect step metrics                                                            |
| `prefer-distribution-workflow-run-metrics` | `false`        | If true, send the distribution metrics instead of gauge metrics                 |
| `prefer-distribution-job-metrics`          | `false`        | If true, send the distribution metrics instead of gauge metrics                 |
| `prefer-distribution-step-metrics`         | `false`        | If true, send the distribution metrics instead of gauge metrics                 |

### Filter metrics

If `metrics-patterns` is set, this action sends the metrics filtered by the glob patterns.
The glob specification is same as [the filters of workflow](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow#using-filters).

To include the specific metrics,

```yaml
steps:
  - uses: int128/datadog-actions-metrics@v1
    with:
      metrics-patterns: |
        github.actions.workflow_run.*
        github.actions.job.*
```

To exclude the specific metrics,

```yaml
steps:
  - uses: int128/datadog-actions-metrics@v1
    with:
      metrics-patterns: |
        *
        !github.actions.*.conclusion.*
```

If both include and exclude patterns are given, the later pattern has higher precedence.

### Exclude Tags

The `tags-to-exclude` input allows you to specify tags that should be excluded from being sent to Datadog. You can provide this as a multiline string where each line contains a tag to be excluded. 

To exclude specific tags, include the `tags-to-exclude` option like this:

```yaml
steps:
  - uses: int128/datadog-actions-metrics@v1
    with:
      tags-to-exclude: |
        job_id
        runs_on
```

Each tag listed in `tags-to-exclude` will not be sent to Datadog, helping you streamline the metrics data you wish to analyze.

### Proxy

To connect to Datadog API via a HTTPS proxy, set `https_proxy` environment variable.
For example,

```yaml
steps:
  - uses: int128/datadog-actions-metrics@v1
    with:
      datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
    env:
      https_proxy: http://proxy.example.com:8080
```

## Contribution

This is an open source software.
Feel free to open issues and pull requests.
