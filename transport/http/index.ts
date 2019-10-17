import { createServer, request as httpRequest } from 'http'

import { HttpConfig, HttpContext } from './types'
import { TransportFn, Transport } from '../types_private'
import { taglogger } from '../../logger'

type HttpTransport = Transport<HttpContext>

const logger = taglogger('transport-http');

export const Http: TransportFn<HttpConfig, HttpTransport> = ({
  host, port
}) => new Promise((resolve, reject) => {
  let responder: (data: Buffer, ctx: HttpContext) => Buffer = null;

  const respond: HttpTransport['respond'] = (callback) => {
    if (responder) {
      logger.error(new Error(`Responder already set`));
    }
    responder = callback;
  }

  const server = createServer((req, res) => {
    const data: Buffer[] = [];
    req.on('data', chunk => data.push(chunk));
    req.on('end', () => {
      const buf = Buffer.concat(data);
      const responseData = responder(Buffer.from(buf), req);
      res.write(responseData, (e) => {
        e && logger.error(e);
        res.end();
      });
    });
  });

  const request: HttpTransport['request'] = (data, ctx = {}) => new Promise(rresolve => {
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
