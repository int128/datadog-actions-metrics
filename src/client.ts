import * as core from '@actions/core'
import { client, v1 } from '@datadog/datadog-api-client'

type Inputs = {
  datadogApiKey?: string
  datadogSite?: string
}

export type SubmitMetrics = (series: v1.Series[], description: string) => Promise<void>

export const createMetricsClient = (inputs: Inputs): SubmitMetrics => {
  if (inputs.datadogApiKey === undefined) {
    // eslint-disable-next-line @typescript-eslint/require-await
    return async (series: v1.Series[], description: string) => {
      core.startGroup(`Metrics payload (dry-run) (${description})`)
      core.info(JSON.stringify(series, undefined, 2))
      core.endGroup()
    }
  }

  const configuration = client.createConfiguration({
    authMethods: {
      apiKeyAuth: inputs.datadogApiKey,
    },
  })
  if (inputs.datadogSite) {
    client.setServerVariables(configuration, {
      site: inputs.datadogSite,
    })
  }
  const metrics = new v1.MetricsApi(configuration)

  return async (series: v1.Series[], description: string) => {
    core.startGroup(`Metrics payload (${description})`)
    core.info(JSON.stringify(series, undefined, 2))
    core.endGroup()

    core.info(`Sending ${series.length} metrics to Datadog`)
    const accepted = await metrics.submitMetrics({ body: { series } })
    core.info(`Sent ${JSON.stringify(accepted)}`)
  }
}
