import { HttpClient, HttpClientResponse } from '@actions/http-client'
import { client } from '@datadog/datadog-api-client'
import { Readable } from 'stream'

export class HttpLibrary implements client.HttpLibrary {
  private client = new HttpClient()

  async send(req: client.RequestContext): Promise<client.ResponseContext> {
    const resp = await this.client.request(req.getHttpMethod(), req.getUrl(), toRequestData(req), req.getHeaders())
    return new client.ResponseContext(resp.message.statusCode ?? 0, toResponseHeaders(resp), {
      text: async () => await resp.readBody(),
      binary: async () => {
        const buffers = []
        for await (const data of resp.message) {
          buffers.push(data)
        }
        return Buffer.concat(buffers)
      },
    })
  }
}

const toRequestData = (req: client.RequestContext) => {
  const body = req.getBody()
  if (body === undefined) {
    return null
  }
  if (typeof body === 'string') {
    return body
  }
  return Readable.from(body)
}

const toResponseHeaders = (resp: HttpClientResponse): { [key: string]: string } => {
  const headers: { [key: string]: string } = {}
  for (const [k, v] of Object.entries(resp.message.headers)) {
    if (typeof v === 'string') {
      headers[k] = v
    } else if (v !== undefined) {
      headers[k] = v[0]
    }
  }
  return headers
}
