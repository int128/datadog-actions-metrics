import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'

export const exampleWorkflowRunMetrics: Series[] = [
  {
    host: 'github.com',
    metric: 'github.actions.workflow_run.total',
    points: [[1579721588, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'conclusion:success',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.workflow_run.conclusion.success_total',
    points: [[1579721588, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'conclusion:success',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.workflow_run.duration_second',
    points: [[1579721588, 0]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'conclusion:success',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.workflow_run.queued_duration_second',
    points: [[1579721588, -179428]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'conclusion:success',
    ],
    type: 'gauge',
  },
]

export const exampleJobMetrics: Series[] = [
  {
    host: 'github.com',
    metric: 'github.actions.job.total',
    points: [[1579542279, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.job.conclusion.success_total',
    points: [[1579542279, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.job.duration_second',
    points: [[1579542279, 119]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.job.queued_duration_second',
    points: [[1579542279, 0]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
]

export const exampleStepMetrics: Series[] = [
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542161, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Set up job',
      'step_number:1',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542161, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Set up job',
      'step_number:1',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542161, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Set up job',
      'step_number:1',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542165, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run actions/checkout@v2',
      'step_number:2',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542165, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run actions/checkout@v2',
      'step_number:2',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542165, 4]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run actions/checkout@v2',
      'step_number:2',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542165, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Set up Ruby',
      'step_number:3',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542165, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Set up Ruby',
      'step_number:3',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542165, 0]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Set up Ruby',
      'step_number:3',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542168, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run actions/cache@v2',
      'step_number:4',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542168, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run actions/cache@v2',
      'step_number:4',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542168, 3]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run actions/cache@v2',
      'step_number:4',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542172, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Install Bundler',
      'step_number:5',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542172, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Install Bundler',
      'step_number:5',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542172, 4]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Install Bundler',
      'step_number:5',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542173, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Install Gems',
      'step_number:6',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542173, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Install Gems',
      'step_number:6',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542173, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Install Gems',
      'step_number:6',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542179, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run Tests',
      'step_number:7',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542179, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run Tests',
      'step_number:7',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542179, 6]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Run Tests',
      'step_number:7',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542279, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Deploy to Heroku',
      'step_number:8',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542279, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Deploy to Heroku',
      'step_number:8',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542279, 100]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Deploy to Heroku',
      'step_number:8',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542279, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Post actions/cache@v2',
      'step_number:16',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542279, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Post actions/cache@v2',
      'step_number:16',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542279, 0]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Post actions/cache@v2',
      'step_number:16',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.total',
    points: [[1579542279, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Complete job',
      'step_number:17',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.conclusion.success_total',
    points: [[1579542279, 1]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Complete job',
      'step_number:17',
      'conclusion:success',
      'status:completed',
    ],
    type: 'count',
  },
  {
    host: 'github.com',
    metric: 'github.actions.step.duration_second',
    points: [[1579542279, 0]],
    tags: [
      'repository_owner:octocat',
      'repository_name:Hello-World',
      'workflow_name:Build',
      'event:push',
      'sender:Codertocat',
      'sender_type:User',
      'branch:master',
      'default_branch:false',
      'job_name:build',
      'step_name:Complete job',
      'step_number:17',
      'conclusion:success',
      'status:completed',
    ],
    type: 'gauge',
  },
]
