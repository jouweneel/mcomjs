import { createSocket } from 'dgram'

import { Transport, TransportFn } from './types'
import { getIp } from './util'
import { taglogger } from '../logger'
import { emitter } from '../util'

interface UdpConfig {
  ip?: string
  mode: 'client' | 'server'
  port: number
}

interface UdpContext {
  broadcast?: boolean
  ip: string
  port: number
}

const logger = taglogger('transport-udp');

export const udp: TransportFn<UdpConfig, UdpContext> = async ({
  ip, mode, port
}) => {
  let connected = false;
  const socket = createSocket('udp4');
  const bcastIp = getIp(true);

  const { emit, on, off } = emitter();

  const socketConnect = () => new Promise((resolve, reject) => {
    socket.on('error', reject);
    socket.on('listening', resolve);
    socket.bind(port, ip, () => socket.setBroadcast(true));
  });

  const disconnect: Transport['disconnect'] = () => new Promise(resolve => {
    if (connected) {
      socket.close(() => resolve());
    } else {
      resolve();
    }
  });

  const connect: Transport['connect'] = async () => {
    if (mode === 'server') {
      await socketConnect();
    }
    connected = true;
  };

  const udpEmit: Transport['emit'] = (
    data, ctx = {}
  ): Promise<number> => new Promise((resolve, reject) => {
    const t_port = ctx.port || port;
    const t_ip = ctx.broadcast ? bcastIp : ctx.ip;
    socket.send(data, t_port, t_ip, (err, size) =>
      err ? reject(err) : resolve(size));
  });

  socket.on('message', (data, info) => {
    emit('data', data, { ip: info.address, port: info.port });
  });

  return {
    context: true,
    connect,
    disconnect,
    emit: udpEmit,
    on, off
  }
};
