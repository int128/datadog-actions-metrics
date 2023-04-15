import { HttpClient } from '@actions/http-client'
import { client } from '@datadog/datadog-api-client'
import { Readable } from 'stream'

export class HttpLibrary implements client.HttpLibrary {
  private client = new HttpClient()

  async send(req: client.RequestContext): Promise<client.ResponseContext> {
    const reqBody = req.getBody()
    let reqData
    if (reqBody instanceof Buffer) {
      reqData = Readable.from(reqBody)
    } else {
      reqData = reqBody ?? null
    }
    const resp = await this.client.request(req.getHttpMethod(), req.getUrl(), reqData, req.getHeaders())
    const respHeaders: { [key: string]: string } = {}
    for (const [k, v] of Object.entries(resp.message.headers)) {
      respHeaders[k] = String(v)
    }
    return new client.ResponseContext(resp.message.statusCode ?? 0, respHeaders, {
      text: () => resp.readBody(),
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
