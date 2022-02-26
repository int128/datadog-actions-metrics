import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'

export const expandSeriesByValues = (series: Series[], key: string, values: string[]): Series[] => {
  if (values.length === 0) {
    return series
  }
  return series.flatMap((s) =>
    values.map((v) => ({
      ...s,
      tags: [...(s.tags ?? []), `${key}:${v}`],
    }))
  )
}
