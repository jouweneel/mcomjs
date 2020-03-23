import { createServer, connect, Socket } from 'net'
import { find } from 'ramda'

import { TcpConfig, TcpContext } from './types'
import { Transport, TransportFn } from '../types_private'
import { taglogger } from '../../logger'

type TcpTransport = Transport<TcpContext>

const logger = taglogger('transport-tcp');

const write = (socket: Socket, data: Buffer): Promise<number> => new Promise((resolve, reject) => {
  socket.write(data, e => {
    if (e) {
      return reject(e);
    }
    return resolve(data.length);
  })
});

const TcpClient: TransportFn<TcpConfig, TcpTransport> = ({
  ip, port
}) => new Promise((resolve, reject) => {
  const socket = connect(port, ip);
  const ctx = { ip, port, socket };
  let iv: any = null;
  
  const emit: TcpTransport['emit'] = async (data, {}) => {
    try {
      return await write(socket, data);
    } catch(e) {
      logger.error(e);
    }
  }

  const on: TcpTransport['on'] = callback => {
    socket.on('data', data => callback(data, ctx));
  }

  const stop: TcpTransport['stop'] = () => new Promise(res => {
    iv = 1;
    socket.end(res);
  });

  socket.on('error', reject);
  socket.on('end', () => {
    if (iv === null) {
      setInterval(() => {
        socket.connect(port, ip);
      }, 10000);
    }
  });
  socket.on('connect', () => {
    if (iv) {
      clearInterval(iv);
      iv = null;
    }
    logger.log(`Connected to ${ip}:${port}`);
    resolve({
      emit,
      on,
      stop
    });
  });
});

const TcpServer: TransportFn<TcpConfig, TcpTransport> = ({
  ip, port
}) => new Promise((resolve, reject) => {
  const connections: TcpContext[] = [];
  const getConnection = ({ ip, port }: TcpContext) => find(
    connection => (connection.ip === ip && connection.port === port)
  , connections);

  const emit: TcpTransport['emit'] = async (data, ctx) => {
    const connection = getConnection(ctx);
    if (!connection) {
      logger.error(new Error(`Socket ${ctx.ip}:${ctx.port} not found`));
      return 0;
    }
    return write(connection.socket, data);
  }

  const server = createServer(socket => {
    const ctx: TcpContext = { ip: socket.remoteAddress, port: socket.remotePort, socket };
    const existing = getConnection(ctx);
    if (existing) {
      connections.splice(connections.indexOf(existing), 1);
    }
    connections.push(ctx);
  });
  server.listen(port, ip);
  server.on('connect', () => resolve({
    emit
  }));
});

export const Tcp: TransportFn<TcpConfig, TcpTransport> = async (cfg) => {
  try {
    return cfg.type === 'server' ? TcpServer(cfg) : TcpClient(cfg);
  } catch(e) {
    logger.error(e);
  }
}
