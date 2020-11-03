import { createServer, request as httpRequest, RequestOptions } from 'http'

import { Transport, TransportFn } from './types'
import { taglogger } from '../logger'

interface HttpConfig {
  host?: string
  port: number
}

type HttpContext = RequestOptions

const logger = taglogger('transport-http');

export const http: TransportFn<HttpConfig, HttpContext> = ({
  host, port
}) => new Promise(resolve => {
  let responder: (data: Buffer, ctx: HttpContext) => Promise<Buffer> = null;

  const respond: Transport<HttpContext>['respond'] = callback => {
    if (responder) {
      throw new Error(`[http] Responder can only be set once`);
    }
    responder = callback;
  }

  const server = createServer((req, res) => {
    let data: Buffer[] = [];
    req.on('data', chunk => data.push(chunk));
    req.on('end', () => {
      const buf = Buffer.concat(data);
      const responseData = responder(Buffer.from(buf), req);
      res.write(responseData, (e) => {
        e && logger.error(e);
        res.end();
      });
      data = [];
    });
  });

  const request: Transport<HttpContext>['request'] = (data, ctx = {}) => new Promise(rresolve => {
    ctx.method = 'POST';
    ctx.port = ctx.port || port;
    const req = httpRequest(ctx, res => {
      const data = [];
      res.on('error', logger.error);
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => rresolve(Buffer.concat(data)));
    });
    req.on('error', logger.error);
    req.write(data, () => req.end());
  });

  const transport = {
    request,
    respond,
    stop: () => new Promise(server.close.bind(server))
  }

  server.on('error', e => logger.error(e));
  server.listen(port, host, () => {
    logger.log(`Listening on ${host ? `${host}:` : ''}${port}`);
    resolve(transport);
  });
});
