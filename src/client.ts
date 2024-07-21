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

class DryRunMetricsClient implements MetricsClient {
  constructor(
    private readonly metricsFilter: (metric: string) => boolean,
    private readonly tags: string[],
  ) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async submitMetrics(series: v1.Series[], description: string): Promise<void> {
    series = series.filter((s) => this.metricsFilter(s.metric))
    series = injectTags(series, this.tags)
    core.startGroup(`Metrics payload (dry-run) (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async submitDistributionPoints(series: v1.DistributionPointsSeries[], description: string): Promise<void> {
    series = series.filter((s) => this.metricsFilter(s.metric))
    series = injectTags(series, this.tags)
    core.startGroup(`Distribution points payload (dry-run) (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
  }
}

class RealMetricsClient implements MetricsClient {
  constructor(
    private readonly metricsApi: v1.MetricsApi,
    private readonly metricsFilter: (metric: string) => boolean,
    private readonly tags: string[],
  ) {}

  async submitMetrics(series: v1.Series[], description: string): Promise<void> {
    series = series.filter((s) => this.metricsFilter(s.metric))
    series = injectTags(series, this.tags)
    core.startGroup(`Metrics payload (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
    core.info(`Sending ${series.length} metrics to Datadog`)
    const accepted = await this.metricsApi.submitMetrics({ body: { series } })
    core.info(`Sent ${JSON.stringify(accepted)}`)
  }

  async submitDistributionPoints(series: v1.DistributionPointsSeries[], description: string): Promise<void> {
    series = series.filter((s) => this.metricsFilter(s.metric))
    series = injectTags(series, this.tags)
    core.startGroup(`Distribution points payload (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
    core.info(`Sending ${series.length} distribution points to Datadog`)
    const accepted = await this.metricsApi.submitDistributionPoints({ body: { series } })
    core.info(`Sent ${JSON.stringify(accepted)}`)
  }
}

const createFilter =
  (patterns: string[]) =>
  (metric: string): boolean => {
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

export const createMetricsClient = (inputs: Inputs): MetricsClient => {
  if (inputs.datadogApiKey === undefined) {
    return new DryRunMetricsClient(createFilter(inputs.metricsFilter), inputs.datadogTags)
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
  return new RealMetricsClient(new v1.MetricsApi(configuration), createFilter(inputs.metricsFilter), inputs.datadogTags)
}

const createHttpLibraryIfHttpsProxy = () => {
  const httpsProxy = process.env['https_proxy']
  if (httpsProxy) {
    core.info(`Using https_proxy: ${httpsProxy}`)
    return new HttpLibrary()
  }
}
