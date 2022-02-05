import { Series } from '@datadog/datadog-api-client/dist/packages/datadog-api-client-v1/models/Series'

export const expandSeriesByLabels = (series: Series[], labels: { name: string }[]): Series[] => {
  if (labels.length === 0) {
    return series
  }
  return series.flatMap((s) =>
    labels.map((label) => ({
      ...s,
      tags: [...(s.tags ?? []), `label:${label.name}`],
    }))
  )
}
