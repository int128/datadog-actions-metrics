import { createMatcher, injectTags } from '../src/client.js'

describe('injectTags', () => {
  it('should return series if tags is empty', () => {
    const series = [{ tags: [] }]
    expect(injectTags(series, [])).toEqual(series)
  })
  it('should return series with tags', () => {
    const series = [{ tags: ['tag1:value1'] }]
    expect(injectTags(series, ['tag2:value2'])).toEqual([{ tags: ['tag1:value1', 'tag2:value2'] }])
  })
})

describe('createMatcher', () => {
  it('should match anything when no pattern is given', () => {
    const filter = createMatcher([])
    expect(filter('foo.bar')).toBe(true)
    expect(filter('foo.baz')).toBe(true)
  })
  it('should match it when a pattern is given', () => {
    const filter = createMatcher(['*.bar'])
    expect(filter('foo.bar')).toBe(true)
    expect(filter('foo.baz')).toBe(false)
  })
  it('should exclude it when a negative pattern is given', () => {
    const filter = createMatcher(['**', '!foo.*'])
    expect(filter('foo.bar')).toBe(false)
    expect(filter('foo.baz')).toBe(false)
    expect(filter('example.bar')).toBe(true)
    expect(filter('example.baz')).toBe(true)
  })
  it('should take precedence to the later pattern', () => {
    // https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow#example-including-and-excluding-branches
    const filter = createMatcher(['*.bar', '!foo.*', '*.baz'])
    expect(filter('foo.bar')).toBe(false)
    expect(filter('foo.baz')).toBe(true)
    expect(filter('example.bar')).toBe(true)
    expect(filter('example.baz')).toBe(true)
  })
})
