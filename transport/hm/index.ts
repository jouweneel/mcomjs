import { createSocket } from 'dgram'

import { build, collect } from './packets'
import { HmConfig, HmContext } from './types'
import { DualTransport, TransportFn } from '../types'
import { getIp } from '../util'

type Transport = DualTransport<HmContext>
type Sub = (ctx: HmContext, data?: Buffer) => void

export const Hm: TransportFn<Transport> = ({
  pubPort,
  subPort
}: HmConfig) => new Promise((resolve, reject) => {
  const socket = createSocket('udp4');
  const bcastIp = getIp(true);
  const subs: Sub[] = [];

  const transmit = (
    ip: string, port: number, data: Buffer
  ): Promise<number> => new Promise((resolve, reject) => {
    socket.send(data, port, ip, (err, size) =>
      err ? reject(err) : resolve(size));
  });

  const emit: Transport['emit'] = async (
    ctx, data
  ) => {
    const ip = ctx.broadcast ? bcastIp : ctx.ip;
    const port = (ctx.port === undefined) ? pubPort : ctx.port;

    const packets = build({
      data,
      id: (ctx.id === undefined) ? 255 : ctx.id,
      flags: (ctx.flags === undefined) ? 0 : ctx.flags
    });
    let size = 0;
    for (const packet of packets) {
      size += await transmit(ip, port, packet);
    }
    return size;
  };

  const on: Transport['on'] = async (callback) => subs.push(callback);

  const connector = {
    emit,
    on,
    stop: () => new Promise(socket.close.bind(socket))
  }

  socket.on('error', reject);
  socket.on('message', (data, info) => {
    const ctx: HmContext = { ip: info.address, port: info.port };
    const message = collect(data);
    if (message != null) {
      ctx.id = message.id;
      ctx.flags = message.flags;

      for (const sub of subs) {
        sub(ctx, message.data);
      }
    }
  });
  socket.on('listening', () => resolve(connector));
  socket.bind(subPort, () => socket.setBroadcast(true));
});
