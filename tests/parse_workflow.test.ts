import { inferRunner, parseWorkflowFile, WorkflowDefinition } from '../src/parse_workflow'

test('parseWorkflowFile', () => {
  const workflowDefinition = parseWorkflowFile(`
jobs:
  ts:
    runs-on: ubuntu-latest
`)
  expect(workflowDefinition).toStrictEqual<WorkflowDefinition>({
    jobs: {
      ts: {
        'runs-on': 'ubuntu-latest',
      },
    },
  })
})

describe('inferRunner returns a runner', () => {
  const workflowDefinition: WorkflowDefinition = {
    jobs: {
      ts: {
        'runs-on': 'ubuntu-latest',
      },
    },
  }

  test('simple name', () => {
    const runner = inferRunner('ts', workflowDefinition)
    expect(runner).toBe('ubuntu-latest')
  })

  test('matrix job name', () => {
    const runner = inferRunner('ts (1, 2, 3)', workflowDefinition)
    expect(runner).toBe('ubuntu-latest')
  })

  test('not found', () => {
    const runner = inferRunner('foo', workflowDefinition)
    expect(runner).toBeUndefined()
  })
})
