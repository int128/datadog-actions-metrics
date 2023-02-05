import WebhookDefinitions, { WebhookDefinition } from '@octokit/webhooks-examples'
import { PullRequestEvent, WebhookEventName, WorkflowRunEvent } from '@octokit/webhooks-types'

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
  eventName: TName
): definition is WebhookDefinition<TName> => definition.name === eventName

const isTypeOfAction = <TEvent extends { action: string }, TAction extends TEvent['action']>(
  event: TEvent,
  action: TAction
): event is TEvent & { action: TAction } => event.action === action

const pullRequestExampleOfAction = <TAction extends PullRequestEvent['action']>(action: TAction) => {
  for (const example of getExamplesByEventName('pull_request')) {
    if (isTypeOfAction(example, action)) {
      return example
    }
  }
  throw new Error(`definition of action ${action} not found`)
}

export const examplePullRequestClosedEvent = pullRequestExampleOfAction('closed')
export const examplePullRequestOpenedEvent = pullRequestExampleOfAction('opened')

const workflowRunExampleOfAction = <T extends WorkflowRunEvent['action']>(action: T) => {
  for (const example of getExamplesByEventName('workflow_run')) {
    if (isTypeOfAction(example, action)) {
      return example
    }
  }
  throw new Error(`definition of action ${action} not found`)
}

export const exampleWorkflowRunCompletedEvent = workflowRunExampleOfAction('completed')
