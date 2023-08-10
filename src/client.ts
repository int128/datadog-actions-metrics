import * as core from '@actions/core'
import { client, v1 } from '@datadog/datadog-api-client'
import { HttpLibrary } from './http'
import { ActionInputs } from './types'
import { setupOtel } from './otel'

export type SubmitMetrics = (series: v1.Series[], description: string) => Promise<void>

// export const createMetricsClient = (inputs: ActionInputs): SubmitMetrics => {
//   if (inputs.datadogApiKey === undefined) {
//     // eslint-disable-next-line @typescript-eslint/require-await
//     return async (series: v1.Series[], description: string) => {
//       core.startGroup(`Metrics payload (dry-run) (${description})`)
//       core.info(JSON.stringify(series, undefined, 2))
//       core.endGroup()
//     }
//   }
//   const configuration = client.createConfiguration({
//     authMethods: {
//       apiKeyAuth: inputs.datadogApiKey,
//     },
//     httpApi: createHttpLibraryIfHttpsProxy(),
//   })
//   if (inputs.datadogSite) {
//     client.setServerVariables(configuration, {
//       site: inputs.datadogSite,
//     })
//   }
//   const metrics = new v1.MetricsApi(configuration)
//   return async (series: v1.Series[], description: string) => {
//     core.startGroup(`Metrics payload (${description})`)
//     core.info(JSON.stringify(series, undefined, 2))
//     core.endGroup()
//     core.info(`Sending ${series.length} metrics to Datadog`)
//     const accepted = await metrics.submitMetrics({ body: { series } })
//     core.info(`Sent ${JSON.stringify(accepted)}`)
//   }
// }

const createHttpLibraryIfHttpsProxy = () => {
  const httpsProxy = process.env['https_proxy']
  if (httpsProxy) {
    core.info(`Using https_proxy: ${httpsProxy}`)
    return new HttpLibrary()
  }
}
