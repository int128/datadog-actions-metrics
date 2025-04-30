import { minimatch } from 'minimatch'
import { v1 } from '@datadog/datadog-api-client'

type Inputs = {
  metricsPatterns: string[]
  tagKeyPatterns: string[]
  datadogTags: string[]
}

type SeriesLike = v1.Series | v1.DistributionPointsSeries

export type MetricsFilter = <S extends Pick<SeriesLike, 'metric' | 'tags'>>(series: S[]) => S[]

export const createMetricsFilter = (inputs: Inputs): MetricsFilter => {
  const metricMatcher = createMatcher(inputs.metricsPatterns)
  const tagsMatcher = createMatcher(inputs.tagKeyPatterns)
  return (series) => {
    series = series.filter((s) => metricMatcher(s.metric))
    series = filterTags(series, tagsMatcher)
    series = injectTags(series, inputs.datadogTags)
    return series
  }
}

type Matcher = (name: string) => boolean

export const createMatcher =
  (patterns: string[]): Matcher =>
  (name: string): boolean => {
    if (patterns.length === 0) {
      return true
    }
    let matched = false
    for (const pattern of patterns) {
      if (pattern.startsWith('!')) {
        matched = matched && minimatch(name, pattern)
      } else {
        matched = matched || minimatch(name, pattern)
      }
    }
    return matched
  }

const filterTags = <S extends Pick<SeriesLike, 'tags'>>(series: S[], matcher: Matcher): S[] =>
  series.map((s) => {
    s.tags = s.tags?.filter((tag) => {
      const tagKey = tag.replace(/:.*/, '')
      return matcher(tagKey)
    })
    return s
  })

export const injectTags = <S extends Pick<SeriesLike, 'tags'>>(series: S[], tags: string[]): S[] => {
  if (tags.length === 0) {
    return series
  }
  return series.map((s) => ({ ...s, tags: [...(s.tags ?? []), ...tags] }))
}
