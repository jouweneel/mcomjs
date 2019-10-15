import { createSocket } from 'dgram'

import { build, collect } from './packets'
import { XudpConfig, XudpContext } from './types'
import { Sub, TransportFn, XTransport } from '../types'
import { getIp } from '../util'
import { taglogger } from '../../logger'

type Transport = XTransport<XudpContext>
type XudpSub = Sub<XudpContext>

const logger = taglogger('transport-Xudp');

export const Xudp: TransportFn<XudpConfig, Transport> = ({
  port
}: XudpConfig) => new Promise((resolve, reject) => {
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

    const emit: Transport['emit'] = async (
      ctx, data
    ) => {
      try {
        const ip = ctx.broadcast ? bcastIp : ctx.ip;
        const t_port = (ctx.port === undefined) ? port : ctx.port;

        const packets = build({
          data,
          id: (ctx.id === undefined) ? 255 : ctx.id,
          flags: (ctx.flags === undefined) ? 0 : ctx.flags
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

    const on: Transport['on'] = async (callback) => subs.push(callback);

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
          ctx.flags = message.flags;

          for (const sub of subs) {
            sub(ctx, message.data);
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
