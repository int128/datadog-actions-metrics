import * as yaml from 'js-yaml'

export type WorkflowDefinition = {
  jobs: {
    [name: string]: {
      name?: string
      'runs-on'?: string
    }
  }
}

export type Error = {
  error: string
}

export const parseWorkflowFile = (s: string): WorkflowDefinition | Error => {
  const y = yaml.load(s)
  if (y == null) {
    return { error: `response.content is ${y}` }
  }
  if (typeof y !== 'object') {
    return { error: `response.content is not object: ${typeof y}` }
  }
  if (!('jobs' in y)) {
    return { error: `response.content does not have field "jobs"` }
  }
  const w = y as WorkflowDefinition
  return w
}

export const inferRunner = (jobName: string, workflowDefinition?: WorkflowDefinition): string | undefined => {
  if (workflowDefinition === undefined) {
    return
  }
  const canonicalJobName = jobName.replace(/ *\(.+?\)/, '')
  for (const k of Object.keys(workflowDefinition.jobs)) {
    const job = workflowDefinition.jobs[k]
    if (canonicalJobName === k || canonicalJobName === job.name) {
      return job['runs-on']
    }
  }
}
