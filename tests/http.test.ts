import { client, v1 } from '@datadog/datadog-api-client'
import { HttpLibrary } from '../src/http'

test('datadog-api-client works with HttpLibrary', async () => {
  const configuration = client.createConfiguration({
    httpApi: new HttpLibrary(),
  })
  // this API does not require authentication
  const api = new v1.IPRangesApi(configuration)
  const payload = await api.getIPRanges()
  expect(payload.version).toBeTruthy()
})
