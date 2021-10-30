# datadog-actions-metrics [![ts](https://github.com/int128/datadog-actions-metrics/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/datadog-actions-metrics/actions/workflows/ts.yaml) [![e2e](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml/badge.svg)](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml)

This is an action to send metrics of GitHub Actions to Datadog when a workflow is completed.
It is inspired from [yuya-takeyama/github-actions-metrics-to-datadog-action](https://github.com/yuya-takeyama/github-actions-metrics-to-datadog-action).


## Example

Here is an example of screenshot in Datadog.

![image](https://user-images.githubusercontent.com/321266/126857281-f0257fec-3079-4cff-98ab-07070e306391.png)

See also the actual metrics in the [E2E test](https://github.com/int128/datadog-actions-metrics/actions/workflows/e2e.yaml).


## Getting Started

You need to create an API key in [Datadog](https://docs.datadoghq.com/account_management/api-app-keys/).

To send the metrics to Datadog when a workflow is completed:

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
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
```


## Parameters

You can set the following inputs:

Name | Type | Description
-----|------|------------
`github-token` | optional | GitHub token to get jobs and steps if needed. Default to `github.token`
`github-token-rate-limit-metrics` | optional | GitHub token for rate limit metrics. Default to `github.token`
`datadog-api-key` | optional | Datadog API key. If not set, this action does not send metrics actually
`collect-job-metrics` | optional | Collect metrics of jobs and steps. Default to `false`

Note that `collect-job-metrics-for-only-default-branch` is no longer supported.
Use `collect-job-metrics` instead.


### Jobs and steps metrics

By default, this actions sends only workflow run metrics.
As well as you can use jobs and steps metrics.
It is useful to improve the deployment pipeline such as build or test.

To send the metrics of jobs and steps:

```yaml
      - uses: int128/datadog-actions-metrics@v1
        with:
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
          collect-job-metrics: true
```

Note that this calls GitHub API to get jobs and steps of a workflow run.
It may cause the rate limit exceeding error if too many workflows are run.

To send the metrics of jobs and steps on the default branch only:

```yaml
      - uses: int128/datadog-actions-metrics@v1
        with:
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
          collect-job-metrics: ${{ github.event.workflow_run.head_branch == github.event.repository.default_branch }}
```


## Metrics

When a workflow is completed, this action sends the following metrics to Datadog:

- Workflow run metrics
- Job metrics
- Step metrics
- Rate limit metrics


### Workflow run

This action sends the following metrics to Datadog:

- `github.actions.workflow_run.total`
- `github.actions.workflow_run.conclusion.{CONCLUSION}_total`
  - e.g. `github.actions.workflow_run.conclusion.success_total`
  - e.g. `github.actions.workflow_run.conclusion.failure_total`
  - See [the official document](https://docs.github.com/en/rest/reference/checks#create-a-check-run) for the possible values of `CONCLUSION` field
- `github.actions.workflow_run.duration_second`
  - Time from a workflow is created to updated
- `github.actions.workflow_run.queued_duration_second`
  - Time from a workflow is created until the first job is started

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


### Job

This action sends the following metrics to Datadog:

- `github.actions.job.total`
- `github.actions.job.conclusion.{CONCLUSION}_total`
  - e.g. `github.actions.job.conclusion.success_total`
  - e.g. `github.actions.job.conclusion.failure_total`
- `github.actions.job.duration_second`
  - Time from a job is started to completed
- `github.actions.job.queued_duration_second`
  - Time from a job is started until the first step is started

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

You need to set `collect-job-metrics` to enable the metrics.


### Step

This action sends the following metrics to Datadog:

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

You need to set `collect-job-metrics` to enable the metrics.


### Rate limit

This action sends the following metrics of [the built-in `GITHUB_TOKEN` rate limit](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting):

- `github.actions.api_rate_limit.remaining`
- `github.actions.api_rate_limit.limit`

It has the following tags:

- `repository_owner`
- `repository_name`
- `resource` is either of values
  - `core`
  - `search`
  - `graphql`


## Contribution

This is an open source software.
Feel free to open issues and pull requests.
