import * as core from '@actions/core'
import { client, v1 } from '@datadog/datadog-api-client'
import { HttpLibrary } from './http'

type Inputs = {
  datadogApiKey?: string
  datadogSite?: string
}

type Metrics = {
  series: v1.Series[]
  distributionPointsSeries?: v1.DistributionPointsSeries[]
}

export type MetricsClient = {
  submit: (metrics: Metrics, description: string) => Promise<void>
}

class DryRunMetricsClient implements MetricsClient {
  // eslint-disable-next-line @typescript-eslint/require-await
  async submit(metrics: Metrics, description: string): Promise<void> {
    core.startGroup(`Metrics payload (dry-run) (${description})`)
    core.info(JSON.stringify(metrics.series, undefined, 2))
    core.endGroup()
    core.startGroup(`Distribution points payload (dry-run) (${description})`)
    core.info(JSON.stringify(metrics.distributionPointsSeries, undefined, 2))
    core.endGroup()
  }
}

class RealMetricsClient implements MetricsClient {
  constructor(private readonly metricsApi: v1.MetricsApi) {}

  async submit(metrics: Metrics, description: string): Promise<void> {
    core.startGroup(`Metrics payload (${description})`)
    core.info(JSON.stringify(metrics.series, undefined, 2))
    core.endGroup()
    if (metrics.series.length > 0) {
      core.info(`Sending ${metrics.series.length} metrics to Datadog`)
      const accepted = await this.metricsApi.submitMetrics({ body: { series: metrics.series } })
      core.info(`Sent ${JSON.stringify(accepted)}`)
    }

    core.startGroup(`Distribution points payload (${description})`)
    core.info(JSON.stringify(metrics.distributionPointsSeries, undefined, 2))
    core.endGroup()
    if (metrics.distributionPointsSeries && metrics.distributionPointsSeries.length > 0) {
      core.info(`Sending ${metrics.distributionPointsSeries.length} distribution points to Datadog`)
      const accepted = await this.metricsApi.submitDistributionPoints({
        body: { series: metrics.distributionPointsSeries },
      })
      core.info(`Sent ${JSON.stringify(accepted)}`)
    }
  }
}

export const createMetricsClient = (inputs: Inputs): MetricsClient => {
  if (inputs.datadogApiKey === undefined) {
    return new DryRunMetricsClient()
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
  return new RealMetricsClient(new v1.MetricsApi(configuration))
}

const createHttpLibraryIfHttpsProxy = () => {
  const httpsProxy = process.env['https_proxy']
  if (httpsProxy) {
    core.info(`Using https_proxy: ${httpsProxy}`)
    return new HttpLibrary()
  }
}
