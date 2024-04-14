import { extractCheckRuns } from '../../src/queries/getCheckSuite.js'

describe('extractCheckRuns', () => {
  it('should return same length of nodes', () => {
    const checkRuns = extractCheckRuns({
      node: {
        __typename: 'CheckSuite',
        checkRuns: {
          nodes: [
            {
              databaseId: 20679829243,
              annotations: {
                nodes: [],
              },
            },
            {
              databaseId: 20679829416,
              annotations: {
                nodes: [],
              },
            },
            {
              databaseId: 20679850772,
              annotations: {
                nodes: [],
              },
            },
          ],
        },
      },
    })
    expect(checkRuns.nodes).toHaveLength(3)
  })

  it('should return same length of annotations', () => {
    const checkRuns = extractCheckRuns({
      node: {
        __typename: 'CheckSuite',
        checkRuns: {
          nodes: [
            {
              databaseId: 20679829243,
              annotations: {
                nodes: [
                  {
                    message: 'test',
                  },
                  {
                    message: 'test',
                  },
                ],
              },
            },
            {
              databaseId: 20679829416,
              annotations: {
                nodes: [
                  {
                    message: 'test',
                  },
                ],
              },
            },
            {
              databaseId: 20679850772,
              annotations: {
                nodes: [],
              },
            },
          ],
        },
      },
    })
    expect(checkRuns.nodes[0].annotations.nodes).toHaveLength(2)
    expect(checkRuns.nodes[1].annotations.nodes).toHaveLength(1)
    expect(checkRuns.nodes[2].annotations.nodes).toHaveLength(0)
  })
})
