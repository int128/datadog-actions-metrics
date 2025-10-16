import type * as http from 'node:http'
import { client, v1 } from '@datadog/datadog-api-client'
import { createProxy } from 'proxy'
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { HttpLibrary } from '../src/http.js'

describe('without proxy', () => {
  test('datadog-api-client works with HttpLibrary', async () => {
    const configuration = client.createConfiguration({
      httpApi: new HttpLibrary(),
    })
    // this API does not require authentication
    const api = new v1.IPRangesApi(configuration)
    const payload = await api.getIPRanges()
    expect(payload.version).toBeTruthy()
  })
})

describe('with proxy', () => {
  let proxyServer: http.Server
  let proxyConnectURLs: string[]
  beforeAll(async () => {
    proxyServer = createProxy()
    proxyServer.on('connect', (req) => proxyConnectURLs.push(String(req.url)))
    await new Promise<void>((resolve) => proxyServer.listen(8091, () => resolve()))
    process.env.https_proxy = 'http://localhost:8091'
  })
  afterAll(() => {
    delete process.env.https_proxy
    proxyServer.close()
  })
  beforeEach(() => {
    proxyConnectURLs = []
  })

  test('datadog-api-client works with HttpLibrary', async () => {
    const configuration = client.createConfiguration({
      httpApi: new HttpLibrary(),
    })
    // this API does not require authentication
    const api = new v1.IPRangesApi(configuration)
    const payload = await api.getIPRanges()
    expect(payload.version).toBeTruthy()
    expect(proxyConnectURLs).toStrictEqual(['ip-ranges.datadoghq.com:443'])
  })
})
