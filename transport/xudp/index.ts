import { createSocket } from 'dgram'

import { c2b, b2c } from './bytecodes'
import { build, collect } from './packets'
import { XudpConfig, XudpContext } from './types'
import { Sub, TransportFn, Transport } from '../types_private'
import { getIp } from '../util'
import { taglogger } from '../../logger'

type UdpTransport = Transport<XudpContext>
type XudpSub = Sub<XudpContext>

const logger = taglogger('transport-Xudp');

export const Xudp: TransportFn<XudpConfig, UdpTransport> = ({
  port
}) => new Promise((resolve, reject) => {
  try {
    const socket = createSocket('udp4');
    const bcastIp = getIp(true);
    const subs: XudpSub[] = [];

    const transmit = (
      t_ip: string, t_port: number, data: Buffer
    ): Promise<number> => new Promise((resolve, reject) => {
      socket.send(data, t_port, t_ip, (err, size) =>
        err ? reject(err) : resolve(size));
    });

    const emit: UdpTransport['emit'] = async (
      data, ctx
    ) => {
      try {
        const ip = ctx.broadcast ? bcastIp : ctx.ip;
        const t_port = (ctx.port === undefined) ? port : ctx.port;

        const packets = build({
          data,
          id: (ctx.id === undefined) ? 255 : ctx.id,
          cls: (ctx.cls === undefined) ? 0 : c2b(ctx.cls)
        });
        let size = 0;
        for (const packet of packets) {
          size += await transmit(ip, t_port, packet);
        }
        logger.debug(`Sent ${packets.length} packets (${data.length}->${size} bytes)`);
        return size;
      } catch(e) {
        logger.error(e);
      }
    };

    const on: UdpTransport['on'] = async (callback) => subs.push(callback);

    const connector = {
      emit,
      on,
      stop: () => new Promise(socket.close.bind(socket))
    }

    socket.on('error', reject);
    socket.on('message', (data, info) => {
      const ctx: XudpContext = { ip: info.address, port: info.port };
      try {
        const message = collect(data);
        if (message != null) {
          ctx.id = message.id;
          ctx.cls = b2c(message.cls);

          for (const sub of subs) {
            sub(message.data, ctx);
          }
        }
      } catch(e) {
        logger.error(e);
      }
    });
    socket.on('listening', () => {
      logger.log(`Listening on port ${port}`);
      return resolve(connector)
    });
    socket.bind(port, () => socket.setBroadcast(true));
  } catch(e) {
    logger.error(e);
  }
});
