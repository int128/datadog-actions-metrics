import { describe, expect, it } from 'vitest'
import { createMatcher, createMetricsFilter, injectTags } from '../src/filter.js'

describe('createMetricsFilter', () => {
  it('passes through series when no patterns are given', () => {
    const filter = createMetricsFilter({
      metricsPatterns: [],
      tagKeyPatterns: [],
      datadogTags: [],
    })
    expect(filter([{ metric: 'example.foo' }])).toEqual([{ metric: 'example.foo' }])
  })
  it('filters out series when a metrics pattern is given', () => {
    const filter = createMetricsFilter({
      metricsPatterns: ['example.*'],
      tagKeyPatterns: [],
      datadogTags: [],
    })
    expect(filter([{ metric: 'example.foo' }, { metric: 'example.bar' }, { metric: 'other.foo' }])).toEqual([
      { metric: 'example.foo' },
      { metric: 'example.bar' },
    ])
  })
  it('filters out tags when a tags pattern is given', () => {
    const filter = createMetricsFilter({
      metricsPatterns: [],
      tagKeyPatterns: ['*', '!foo', '!example_*'],
      datadogTags: [],
    })
    expect(
      filter([
        { metric: 'example1', tags: ['example_bar:value', 'foo:value', 'other_baz:value'] },
        { metric: 'example2', tags: ['example_baz:value'] },
        { metric: 'example3' },
      ]),
    ).toEqual([
      { metric: 'example1', tags: ['other_baz:value'] },
      { metric: 'example2', tags: [] },
      { metric: 'example3' },
    ])
  })
})

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
    const matcher = createMatcher([])
    expect(matcher('github.foo.bar')).toBe(true)
    expect(matcher('github.foo.baz')).toBe(true)
  })
  it('should match it when a pattern is given', () => {
    const matcher = createMatcher(['*.bar'])
    expect(matcher('github.foo.bar')).toBe(true)
    expect(matcher('github.foo.baz')).toBe(false)
  })
  it('should exclude it when a negative pattern is given', () => {
    const matcher = createMatcher(['*', '!*.github.*'])
    expect(matcher('foo.github.bar')).toBe(false)
    expect(matcher('foo.github.baz')).toBe(false)
    expect(matcher('example.bar')).toBe(true)
    expect(matcher('example.baz')).toBe(true)
  })
  it('should take higher precedence to the later pattern', () => {
    // https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/triggering-a-workflow#example-including-and-excluding-branches
    const matcher = createMatcher(['*.bar', '!foo.*', '*.baz'])
    expect(matcher('foo.github.bar')).toBe(false)
    expect(matcher('foo.github.baz')).toBe(true)
    expect(matcher('example.bar')).toBe(true)
    expect(matcher('example.baz')).toBe(true)
  })
})
