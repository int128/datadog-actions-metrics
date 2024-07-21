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

describe('createMetricsFilter', () => {
  it('should match', () => {
    const filter = createMatcher(['*.bar', '!foo.*'])
    expect(filter('foo.bar')).toBeTruthy()
  })
})
