import { injectTags, filterMetrics } from '../src/client'

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

describe('filterMetrics', () => {
  it('should return series if filteredMetrics is empty', () => {
    const series = [{ metric: 'metric1' }]
    expect(filterMetrics(series, [])).toEqual(series)
  })
  it('should return series without filteredMetrics', () => {
    const series = [{ metric: 'metric1' }, { metric: 'metric2' }]
    expect(filterMetrics(series, ['metric2'])).toEqual([{ metric: 'metric2' }])
  })
})
