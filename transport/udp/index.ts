import { createSocket } from 'dgram'

import { UdpConfig, UdpContext } from './types'
import { Sub, TransportFn, Transport } from '../types_private'
import { getIp } from '../util'
import { taglogger } from '../../logger'

type UdpTransport = Transport<UdpContext>
type UdpSub = Sub<UdpContext>

const logger = taglogger('transport-Udp');

export const Udp: TransportFn<UdpConfig, UdpTransport> = ({
  port
}) => new Promise((resolve, reject) => {
  try {
    const socket = createSocket('udp4');
    const bcastIp = getIp(true);
    const subs: UdpSub[] = [];

    const emit: UdpTransport['emit'] = (
      data, ctx
    ): Promise<number> => new Promise((resolve, reject) => {
      const t_port = ctx.port || port;
      const t_ip = ctx.broadcast ? bcastIp : ctx.ip;
      socket.send(data, t_port, t_ip, (err, size) =>
        err ? reject(err) : resolve(size));
    });

    const on: UdpTransport['on'] = async (callback) => subs.push(callback);

    const connector = {
      emit,
      on,
      stop: () => new Promise(socket.close.bind(socket))
    }

    socket.on('error', reject);
    socket.on('message', (data, info) => {
      const ctx: UdpContext = { ip: info.address, port: info.port };
      for (const sub of subs) {
        sub(data, ctx);
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
