import fs from 'fs/promises'
import { WebhookDefinition } from '@octokit/webhooks-examples'
import { PullRequestClosedEvent, PullRequestOpenedEvent, WorkflowRunCompletedEvent } from '@octokit/webhooks-types'

const examples = (
  JSON.parse(
    await fs.readFile('node_modules/@octokit/webhooks-examples/api.github.com/index.json', 'utf-8'),
  ) as WebhookDefinition[]
).flatMap((definition) => definition.examples)

export const examplePullRequestClosedEvent: PullRequestClosedEvent = (() => {
  for (const example of examples) {
    if ('pull_request' in example && 'action' in example && example.action === 'closed') {
      return example
    }
  }
  throw new Error(`no example of PullRequestClosedEvent`)
})()

export const examplePullRequestOpenedEvent: PullRequestOpenedEvent = (() => {
  for (const example of examples) {
    if ('pull_request' in example && 'action' in example && example.action === 'opened') {
      return example
    }
  }
  throw new Error(`no example of PullRequestOpenedEvent`)
})()

export const exampleWorkflowRunCompletedEvent: WorkflowRunCompletedEvent = (() => {
  for (const example of examples) {
    if ('workflow_run' in example && 'action' in example && example.action === 'completed') {
      return example
    }
  }
  throw new Error(`no example of WorkflowRunCompletedEvent`)
})()
