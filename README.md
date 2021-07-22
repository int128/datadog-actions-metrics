# datadog-actions-metrics [![ts](https://github.com/int128/datadog-actions-metrics/actions/workflows/ts.yaml/badge.svg)](https://github.com/int128/datadog-actions-metrics/actions/workflows/ts.yaml)

This is an action to send metrics of GitHub Actions to Datadog when a workflow is completed.
It is inspired from @yuya-takeyama's [github-actions-metrics-to-datadog-action](https://github.com/yuya-takeyama/github-actions-metrics-to-datadog-action).


## Getting Started

To run this action when a workflow is completed:

```yaml
on:
  workflow_run:
    workflows:
      - '**'
    types:
      - completed

jobs:
  submit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: int128/datadog-actions-metrics@v1
        with:
          datadog-api-key: ${{ secrets.DATADOG_API_KEY }}
```

You need to create an API key in [Datadog](https://docs.datadoghq.com/account_management/api-app-keys/).
If `datadog-api-key` is not set, this action does not send metrics actually.


## Metrics

When a workflow is completed, this action sends the following kinds of metrics to Datadog:

- Workflow run related metrics
- Job related metrics
- Step related metrics


### Workflow run

This action sends the following metrics to Datadog:

- `github.actions.workflow_run.total`
- `github.actions.workflow_run.conclusion.{CONCLUSION}_total`
  - e.g. `github.actions.workflow_run.conclusion.success_total`
  - e.g. `github.actions.workflow_run.conclusion.failure_total`
  - See [the official document](https://docs.github.com/en/rest/reference/checks#create-a-check-run) for the possible values of `CONCLUSION` field

It has the following tags:

- `repository_owner`
- `repository_name`
- `workflow_name`
- `event`
- `conclusion`
- `branch`
- `default_branch` = `true` or `false`

### Job

This action sends the following metrics to Datadog:

- `github.actions.job.total`
- `github.actions.job.conclusion.{CONCLUSION}_total`
  - e.g. `github.actions.job.conclusion.success_total`
  - e.g. `github.actions.job.conclusion.failure_total`
- `github.actions.job.duration_second`

It has the following tags:

- `repository_owner`
- `repository_name`
- `workflow_name`
- `event`
- `branch`
- `default_branch` = `true` or `false`
- `job_name`
- `conclusion`
- `status`

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
- `event`
- `branch`
- `default_branch` = `true` or `false`
- `job_name`
- `step_name`
- `conclusion`
- `status`


## Contribution

This is an open source software.
Feel free to open issues and pull requests.
