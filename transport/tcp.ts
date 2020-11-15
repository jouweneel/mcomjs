import { createServer, Socket } from 'net'

import { Transport, TransportFn } from './types'
import { taglogger } from '../logger'
import { emitter, find } from '../util'

interface TcpConfig {
  ip?: string
  port: number
  mode?: 'server' | 'client'
}

export interface TcpContext {
  ip: string
  port: number
}

const logger = taglogger('transport-tcp');

const write = (socket: Socket, data: Buffer): Promise<number> => new Promise((resolve, reject) => {
  socket.write(data, e => e ? reject(e) : resolve(data.length));
});

const TcpClient: TransportFn<TcpConfig, TcpContext> = async ({
  ip, port
}) => {
  const socket = new Socket();
  const { emit, on } = emitter();
  
  socket.on('data', data => emit('data', data));
  socket.on('end', () => emit('disconnect'));

  const connect: Transport['connect'] = () => new Promise((resolve, reject) => {
    socket.on('connect', () => {
      emit('connect');
      resolve();
    });
    socket.on('error', reject);
    socket.connect(port, ip);
  });

  const tcpEmit: Transport['emit'] = data => write(socket, data);

  await connect();

  return {
    context: true,
    connect,
    disconnect: socket.destroy.bind(socket),
    emit: tcpEmit,
    on
  };
};

const TcpServer: TransportFn<TcpConfig, TcpContext> = async ({
  ip, port
}) => {
  const clients: (TcpContext & {socket: Socket})[] = [];
  const { emit, on } = emitter();

  const server = createServer(socket => {
    const existing = find(s => s.ip === socket.remoteAddress, clients);
    if (existing) {
      socket.destroy();
      throw new Error('only 1 tcp connection allowed per ip');
    }

    const client = { ip: socket.remoteAddress, port: socket.remotePort, socket };
    const ctx = { ip: client.ip, port: client.port };

    clients.push(client);
    emit('connect', ctx);

    socket.on('data', data => emit('data', data, ctx));
    socket.on('close', () => {
      emit('disconnect', ctx);
      clients.splice(clients.indexOf(client), 1);
    });
  });

  const connect: Transport['connect'] = () => new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, ip, resolve);
  });

  const disconnect: Transport['disconnect'] = ctx => new Promise((resolve, reject) => {
    if (!ctx) {
      emit('disconnect');
      server.close(e => e ? reject(e) : resolve());
    } else {
      const client = find(s => s.ip === ctx.ip, clients);
      client.socket.destroy();
      emit('disconnect', { ip: client.ip, port: client.port });
      clients.splice(clients.indexOf(client), 1);
    }
  });

  const tcpEmit: Transport<TcpConfig>['emit'] = async (data, ctx) => {
    const { socket } = find(s => s.ip === ctx.ip, clients);
    return write(socket, data);
  }

  await connect();
  logger.debug(`${ip || 'localhost'}:${port} connected`);

  return {
    connect,
    disconnect,
    emit: tcpEmit,
    on
  };
}

export const tcp: TransportFn<TcpConfig, TcpContext> = async ({ mode, ...cfg }) => {
  try {
    return mode === 'server' ? TcpServer(cfg) : TcpClient(cfg);
  } catch(e) {
    logger.error(e);
  }
}
