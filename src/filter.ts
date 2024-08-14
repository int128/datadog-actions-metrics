import { minimatch } from 'minimatch'
import { v1 } from '@datadog/datadog-api-client'

type Inputs = {
  metricsPatterns: string[]
  datadogTags: string[]
}

export type MetricsFilter = <S extends v1.Series | v1.DistributionPointsSeries>(series: S[]) => S[]

export const createMetricsFilter = (inputs: Inputs): MetricsFilter => {
  const matcher = createMatcher(inputs.metricsPatterns)
  return (series) => {
    series = series.filter((s) => matcher(s.metric))
    return injectTags(series, inputs.datadogTags)
  }
}

export const createMatcher =
  (patterns: string[]) =>
  (metric: string): boolean => {
    if (patterns.length === 0) {
      return true
    }
    let matched = false
    for (const pattern of patterns) {
      if (pattern.startsWith('!')) {
        matched = matched && minimatch(metric, pattern)
      } else {
        matched = matched || minimatch(metric, pattern)
      }
    }
    return matched
  }

export const injectTags = <S extends { tags?: string[] }>(series: S[], tags: string[]): S[] => {
  if (tags.length === 0) {
    return series
  }
  return series.map((s) => ({ ...s, tags: [...(s.tags ?? []), ...tags] }))
}
