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

export const parseWorkflowFile = (s: string): WorkflowDefinition => {
  const parsed = yaml.load(s)
  if (parsed == null) {
    throw new Error(`workflow is not defined`)
  }
  if (typeof parsed !== 'object') {
    throw new Error(`workflow is not valid object: ${typeof parsed}`)
  }
  if (!('jobs' in parsed)) {
    throw new Error(`workflow does not have field "jobs"`)
  }
  return parsed as WorkflowDefinition
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
