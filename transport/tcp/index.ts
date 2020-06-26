import { createServer, connect, Socket } from 'net'
import { find } from 'ramda'

import { TcpConfig, TcpContext } from './types'
import { Sub, Transport, TransportFn } from '../types_private'
import { taglogger } from '../../logger'

type TcpTransport = Transport<TcpContext>
type TcpSub = Sub<TcpContext>

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
  const socket = new Socket();
  const ctx = { ip, port, socket };
  let iv: any = null;
  
  const emit: TcpTransport['emit'] = async (data, {}) => {
    try {
      return write(socket, data);
    } catch(e) {
      logger.error(e);
    }
  }

  const on: TcpTransport['on'] = callback => {
    socket.on('data', data => callback(data, ctx));
  }

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
      on
    });
  });
  socket.connect(port, ip);
});

const TcpServer: TransportFn<TcpConfig, TcpTransport> = ({
  ip, port
}) => new Promise((resolve, reject) => {
  const connections: TcpContext[] = [];
  const subs: TcpSub[] = [];

  const getConnection = ({ ip, port }: Partial<TcpContext>) => find(
    connection => (connection.ip === ip && connection.port === port)
  , connections);

  const emit: TcpTransport['emit'] = async (data, ctx) => write(ctx.socket, data);

  const on: TcpTransport['on'] = async (cb) => subs.push(cb);

  const server = createServer(socket => {
    const existing = getConnection({ ip: socket.remoteAddress, port: socket.remotePort });
    const ctx = existing ? existing : { ip: socket.remoteAddress, port: socket.remotePort, socket };
    if (!existing) {
      connections.push(ctx);
    }
    socket.on('data', data => {
      for (const sub of subs) {
        sub(data, ctx);
      }
    });
    socket.on('close', () => {
      logger.debug(`Socket ${ctx.ip} disconnected`);
      connections.splice(connections.indexOf(ctx), 1);
    });
  });

  server.on('error', reject);

  server.listen(port, ip, () => {
    logger.debug(`server running on ${ip || ''}:${port}`);
    resolve({
      emit,
      on
    });
  });
});

export const Tcp: TransportFn<TcpConfig, TcpTransport> = async (cfg) => {
  try {
    return cfg.type === 'server' ? TcpServer(cfg) : TcpClient(cfg);
  } catch(e) {
    logger.error(e);
  }
}
