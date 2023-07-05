import WebhookDefinitions, { WebhookDefinition } from '@octokit/webhooks-examples'
import {
  PullRequestClosedEvent,
  PullRequestOpenedEvent,
  WebhookEventName,
  WorkflowRunCompletedEvent,
} from '@octokit/webhooks-types'

const getExamplesByEventName = <E extends WebhookEventName>(eventName: E) => {
  for (const definition of WebhookDefinitions) {
    if (isTypeOfEventName(definition, eventName)) {
      return definition.examples
    }
  }
  throw new Error(`definition of event ${eventName} not found`)
}

const isTypeOfEventName = <TName extends WebhookEventName>(
  definition: WebhookDefinition,
  eventName: TName,
): definition is WebhookDefinition<TName> => definition.name === eventName

export const examplePullRequestClosedEvent: PullRequestClosedEvent = (() => {
  for (const example of getExamplesByEventName('pull_request')) {
    if (example.action === 'closed') {
      return example
    }
  }
  throw new Error(`unexpected type error`)
})()

export const examplePullRequestOpenedEvent: PullRequestOpenedEvent = (() => {
  for (const example of getExamplesByEventName('pull_request')) {
    if (example.action === 'opened') {
      return example
    }
  }
  throw new Error(`unexpected type error`)
})()

export const exampleWorkflowRunCompletedEvent: WorkflowRunCompletedEvent = (() => {
  for (const example of getExamplesByEventName('workflow_run')) {
    if (example.action === 'completed') {
      return example
    }
  }
  throw new Error(`unexpected type error`)
})()
