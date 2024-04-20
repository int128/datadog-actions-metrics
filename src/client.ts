import * as core from '@actions/core'
import { client, v1 } from '@datadog/datadog-api-client'
import { HttpLibrary } from './http'

type Inputs = {
  datadogApiKey?: string
  datadogSite?: string
  datadogTags: string[]
  disableDistributionMetrics: boolean
  filteredMetrics: string[]
}

export type MetricsClient = {
  submitMetrics: (series: v1.Series[], description: string) => Promise<void>
  submitDistributionPoints(series: v1.DistributionPointsSeries[], description: string): Promise<void>
}

class DryRunMetricsClient implements MetricsClient {
  constructor(private readonly tags: string[], private readonly filteredMetrics: string[]) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async submitMetrics(series: v1.Series[], description: string): Promise<void> {
    series = injectTags(series, this.tags)
    series = filterMetrics(series, this.filteredMetrics)
    core.startGroup(`Metrics payload (dry-run) (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async submitDistributionPoints(series: v1.DistributionPointsSeries[], description: string): Promise<void> {
    series = injectTags(series, this.tags)
    series = filterMetrics(series, this.filteredMetrics)
    core.startGroup(`Distribution points payload (dry-run) (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
  }
}

class RealMetricsClient implements MetricsClient {
  constructor(
    private readonly metricsApi: v1.MetricsApi,
    private readonly tags: string[],
    private readonly disableDistributionMetrics: boolean,
    private readonly filteredMetrics: string[]
  ) {}

  async submitMetrics(series: v1.Series[], description: string): Promise<void> {
    series = injectTags(series, this.tags)
    series = filterMetrics(series, this.filteredMetrics)
    core.startGroup(`Metrics payload (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
    core.info(`Sending ${series.length} metrics to Datadog`)
    const accepted = await this.metricsApi.submitMetrics({ body: { series } })
    core.info(`Sent ${JSON.stringify(accepted)}`)
  }

  async submitDistributionPoints(series: v1.DistributionPointsSeries[], description: string): Promise<void> {
    series = injectTags(series, this.tags)
    series = filterMetrics(series, this.filteredMetrics)
    core.startGroup(`Distribution points payload (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()
    if (this.disableDistributionMetrics) {
      core.info(`Distribution metrics are disabled`)
      return
    }
    core.info(`Sending ${series.length} distribution points to Datadog`)
    const accepted = await this.metricsApi.submitDistributionPoints({ body: { series } })
    core.info(`Sent ${JSON.stringify(accepted)}`)
  }
}

export const injectTags = <S extends { tags?: string[] }>(series: S[], tags: string[]): S[] => {
  if (tags.length === 0) {
    return series
  }
  return series.map((s) => ({ ...s, tags: [...(s.tags ?? []), ...tags] }))
}

export const filterMetrics = <S extends { metric: string }>(series: S[], filteredMetrics: string[]): S[] => {
  if (filteredMetrics.length === 0) {
    return series
  }
  return series.filter((s) => filteredMetrics.includes(s.metric))
}

export const createMetricsClient = (inputs: Inputs): MetricsClient => {
  if (inputs.datadogApiKey === undefined) {
    return new DryRunMetricsClient(inputs.datadogTags, inputs.filteredMetrics)
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
  return new RealMetricsClient(new v1.MetricsApi(configuration), inputs.datadogTags, inputs.disableDistributionMetrics, inputs.filteredMetrics)
}

const createHttpLibraryIfHttpsProxy = () => {
  const httpsProxy = process.env['https_proxy']
  if (httpsProxy) {
    core.info(`Using https_proxy: ${httpsProxy}`)
    return new HttpLibrary()
  }
}
