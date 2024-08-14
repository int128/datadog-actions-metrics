import * as core from '@actions/core'
import { minimatch } from 'minimatch'
import { client, v1 } from '@datadog/datadog-api-client'
import { HttpLibrary } from './http.js'

type Inputs = {
  datadogApiKey?: string
  datadogSite?: string
  datadogTags: string[]
  metricsFilter: string[]
}

export type MetricsClient = {
  submitMetrics: (series: v1.Series[], description: string) => Promise<void>
  submitDistributionPoints(series: v1.DistributionPointsSeries[], description: string): Promise<void>
}

type MetricsFilter = <S extends v1.Series | v1.DistributionPointsSeries>(series: S[]) => S[]

class DryRunMetricsClient implements MetricsClient {
  constructor(private readonly metricsFilter: MetricsFilter) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async submitMetrics(series: v1.Series[], description: string): Promise<void> {
    series = this.metricsFilter(series)
    core.startGroup(`Metrics payload (dry-run) (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async submitDistributionPoints(series: v1.DistributionPointsSeries[], description: string): Promise<void> {
    series = this.metricsFilter(series)
    core.startGroup(`Distribution points payload (dry-run) (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
  }
}

class RealMetricsClient implements MetricsClient {
  constructor(
    private readonly metricsApi: v1.MetricsApi,
    private readonly metricsFilter: MetricsFilter,
  ) {}

  async submitMetrics(series: v1.Series[], description: string): Promise<void> {
    series = this.metricsFilter(series)
    core.startGroup(`Metrics payload (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
    core.info(`Sending ${series.length} metrics to Datadog`)
    const accepted = await this.metricsApi.submitMetrics({ body: { series } })
    core.info(`Sent ${JSON.stringify(accepted)}`)
  }

  async submitDistributionPoints(series: v1.DistributionPointsSeries[], description: string): Promise<void> {
    series = this.metricsFilter(series)
    core.startGroup(`Distribution points payload (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
    core.info(`Sending ${series.length} distribution points to Datadog`)
    const accepted = await this.metricsApi.submitDistributionPoints({ body: { series } })
    core.info(`Sent ${JSON.stringify(accepted)}`)
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

const createMetricsFilter = (inputs: Inputs): MetricsFilter => {
  const matcher = createMatcher(inputs.metricsFilter)
  return (series) => {
    series = series.filter((s) => matcher(s.metric))
    return injectTags(series, inputs.datadogTags)
  }
}

export const createMetricsClient = (inputs: Inputs): MetricsClient => {
  if (inputs.datadogApiKey === undefined) {
    return new DryRunMetricsClient(createMetricsFilter(inputs))
  }

  const configuration = client.createConfiguration({
    authMethods: {
      apiKeyAuth: inputs.datadogApiKey,
    },
    httpApi: createHttpLibraryIfHttpsProxy(),
  })
  if (inputs.datadogSite) {
    client.setServerVariables(configuration, {
      site: inputs.datadogSite,
    })
  }
  return new RealMetricsClient(new v1.MetricsApi(configuration), createMetricsFilter(inputs))
}

const createHttpLibraryIfHttpsProxy = () => {
  const httpsProxy = process.env['https_proxy']
  if (httpsProxy) {
    core.info(`Using https_proxy: ${httpsProxy}`)
    return new HttpLibrary()
  }
}
