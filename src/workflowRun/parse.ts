import assert from 'assert'
import * as yaml from 'js-yaml'

export type WorkflowDefinition = {
  jobs: {
    [name: string]: {
      name?: string
      'runs-on'?: string
    }
  }
}

export const parseWorkflowFile = (s: string): WorkflowDefinition => {
  const workflow = yaml.load(s)
  assertWorkflowDefinition(workflow)
  return workflow
}

function assertWorkflowDefinition(x: unknown): asserts x is WorkflowDefinition {
  assert(typeof x === 'object')
  assert(x !== null)
  assert('jobs' in x)
  assert(typeof x.jobs === 'object')
}

export const inferRunner = (jobName: string, workflowDefinition?: WorkflowDefinition): string | undefined => {
  if (workflowDefinition === undefined) {
    return
  }
  const canonicalJobName = jobName.replace(/ *\(.+?\)/, '')
  for (const k of Object.keys(workflowDefinition.jobs)) {
    const job = workflowDefinition.jobs[k]
    // exact match
    if (canonicalJobName === k || canonicalJobName === job.name) {
      return job['runs-on']
    }
    // consider expression(s) in name property
    if (job.name?.search(/\$\{\{.+?\}\}/)) {
      const pattern = `^${job.name
        .split(/\$\{\{.+?\}\}/)
        .map(escapeRegex)
        .join('.+?')}$`
      if (new RegExp(pattern).test(jobName)) {
        return job['runs-on']
      }
    }
  }
}

// https://github.com/tc39/proposal-regex-escaping
const escapeRegex = (s: string): string => s.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
