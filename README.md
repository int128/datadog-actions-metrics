# datadog-actions-metrics [![ts](https://github.com/int128/datadog-actions-metrics/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/datadog-actions-metrics/actions/workflows/ts.yaml) [![e2e](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml/badge.svg)](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml)

This is an action to send metrics of GitHub Actions to Datadog on an event.
It is inspired from [yuya-takeyama/github-actions-metrics-to-datadog-action](https://github.com/yuya-takeyama/github-actions-metrics-to-datadog-action).


## Purpose

### Improve the reliability and experience of CI/CD pipeline

To collect the metrics when a workflow is completed:

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

Here is an example of screenshot in Datadog.

![image](https://user-images.githubusercontent.com/321266/126857281-f0257fec-3079-4cff-98ab-07070e306391.png)

For developer experience, you can analyze the following metrics:

- Time to test an application
- Time to deploy an application

For reliability, you can monitor the following metrics:

- Success rate of the main branch
- Rate limit of built-in `GITHUB_TOKEN`


### Improve the reliability and experience of self-hosted runners

For the self-hosted runners, you can monitor the following metrics for reliability and experience:

- Count of the [lost communication with the server](https://github.com/actions-runner-controller/actions-runner-controller/issues/466) errors
- Queued time of job (time to pick a job by a runner)


### Improve your team development process

You can analyze your development activity such as number of merged pull requests.
It helps the continuous process improvement of your team.

To collect the metrics when a pull request is opened or closed:

```yaml
on:
  pull_request:
    types:
      - opened
      - closed

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

This action handles the following events:

- workflow_run event
- pull_request event
- push event
- schedule event

It ignores other events.


## Metrics for workflow_run event

### Workflow run

This action sends the following metrics.

- `github.actions.workflow_run.total`
- `github.actions.workflow_run.conclusion.{CONCLUSION}_total`
  - e.g. `github.actions.workflow_run.conclusion.success_total`
  - e.g. `github.actions.workflow_run.conclusion.failure_total`
  - See [the official document](https://docs.github.com/en/rest/reference/checks#create-a-check-run) for the possible values of `CONCLUSION` field
- `github.actions.workflow_run.duration_second`
  - Time from a workflow is started until it is updated
- `github.actions.workflow_run.queued_duration_second`
  - Total queued time of jobs, i.e. (workflow run duration) - (total of job durations)
  - Available if the jobs metrics is enabled

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
- `conclusion`

See also the actual metrics in the [E2E test](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml).


### Job

This action sends the following metrics if enabled.

- `github.actions.job.total`
- `github.actions.job.conclusion.{CONCLUSION}_total`
  - e.g. `github.actions.job.conclusion.success_total`
  - e.g. `github.actions.job.conclusion.failure_total`
- `github.actions.job.duration_second`
  - Time from a job is started to completed
- `github.actions.job.queued_duration_second`
  - Time from a job is started until the first step is started
- `github.actions.job.lost_communication_with_server_error_total`
  - Count of "lost communication with the server" errors of self-hosted runners.
    See the issue [#444](https://github.com/int128/datadog-actions-metrics/issues/444) for details

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
- `job_name`
- `job_id`
- `conclusion`
- `status`
- `runs_on`
  - Runner label inferred from the workflow file if available
  - e.g. `ubuntu-latest`


### Step

This action sends the following metrics if enabled.

- `github.actions.step.total`
- `github.actions.step.conclusion.{CONCLUSION}_total`
  - e.g. `github.actions.step.conclusion.success_total`
  - e.g. `github.actions.step.conclusion.failure_total`
- `github.actions.step.duration_second`

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
- `job_name`
- `job_id`
- `step_name`
- `step_number` = 1, 2, ...
- `conclusion`
- `status`
- `runs_on`
  - Runner label inferred from the workflow file if available
  - e.g. `ubuntu-latest`


### Enable job and step metrics

To send the metrics of jobs and steps:

```yaml
      - uses: int128/datadog-actions-metrics@v1
        with:
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
          collect-job-metrics: true
```

Note that this action calls GitHub GraphQL API to get jobs and steps of a workflow run.
It may cause the rate exceeding error if too many workflows are run.

To send the metrics of jobs and steps on the default branch only:

```yaml
      - uses: int128/datadog-actions-metrics@v1
        with:
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
          collect-job-metrics: ${{ github.event.workflow_run.head_branch == github.event.repository.default_branch }}
```


## Metrics for pull_request event

### Pull request (opened)

This action sends the following metrics on `opened` type.

- `github.actions.pull_request_opened.total`
- `github.actions.pull_request_opened.commits`
- `github.actions.pull_request_opened.changed_files`
- `github.actions.pull_request_opened.additions`
- `github.actions.pull_request_opened.deletions`

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
- `github.actions.pull_request_closed.since_opened_seconds`
  - Time from a pull request is opened to closed
- `github.actions.pull_request_closed.since_first_authored_seconds`
  - Time from the authored time of the first commit until closed
- `github.actions.pull_request_closed.since_first_committed_seconds`
  - Time from the committed time of the first commit until closed
- `github.actions.pull_request_closed.commits`
- `github.actions.pull_request_closed.changed_files`
- `github.actions.pull_request_closed.additions`
- `github.actions.pull_request_closed.deletions`

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


## Metrics for push event

This action sends the following metrics.

- `github.actions.push.total`

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

- `github.actions.schedule.queued_workflow_run.total` (gauge)

It has the following tags:

- `repository_owner`
- `repository_name`

It is useful for monitoring self-hosted runners.


## Metrics for all supported events

### Rate limit

This action always sends the following metrics of [the built-in `GITHUB_TOKEN` rate limit](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting).

- `github.actions.api_rate_limit.remaining`
- `github.actions.api_rate_limit.limit`

It has the following tags:

- `repository_owner`
- `repository_name`
- `resource` = `core`, `search` and `graphql`

This does not affect the rate limit of GitHub API because it just calls [`/rate_limit` endpoint](https://docs.github.com/en/rest/reference/rate-limit).


## Specification

You can set the following inputs:

Name | Default | Description
-----|---------|------------
`github-token` | `github.token` | GitHub token to get jobs and steps if needed
`github-token-rate-limit-metrics` | `github.token` | GitHub token for rate limit metrics
`datadog-api-key` | - | Datadog API key. If not set, this action does not send metrics actually
`datadog-site` | - | Datadog Server name such as `datadoghq.eu`, `ddog-gov.com`, `us3.datadoghq.com`
`send-pull-request-labels` | `false` | Send pull request labels as Datadog tags
`collect-job-metrics` | `false` | Collect metrics of jobs and steps

Note that `collect-job-metrics-for-only-default-branch` is no longer supported.
Use `collect-job-metrics` instead.


## Contribution

This is an open source software.
Feel free to open issues and pull requests.
