import * as protocols from './protocol'
import * as transports from './transport'

import { taglogger } from './logger'
import { MCom, McomMessage, McomProtocol } from './types'
import { Transport } from './transport/types'
export * from './util'

export type ProtocolKey = keyof (typeof protocols);
export type TransportKey = keyof (typeof transports);

const logger = taglogger('MCom');

export const mCom = async (
  ptc: { protocol: keyof (typeof protocols), transport: keyof (typeof transports), config: Record<string,any> }
): Promise<MCom> => {
  const protocol: McomProtocol = protocols[ptc.protocol];
  const transport: Transport<unknown> = await (transports)[ptc.transport](ptc.config as any);

  let transportCallbacks: any[] = [];
  let mcomCallbacks: any[] = [];

  const emit = async (msg: McomMessage, ctx?: Record<string,any>) => {
    if (!transport.emit) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'emit'`));
    } else {
      return await transport.emit(protocol.encode(msg), ctx);
    }
  };

  const on: MCom['on'] = async (
    event, callback
  ) => {
    if (!transport.on) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'on'`));
    }
    
    if (event === 'data') {
      const cb = (data: Buffer, ctx: Record<string,any>) => {
        callback(protocol.decode(data), ctx)
      };
      transportCallbacks.push(callback);
      mcomCallbacks.push(cb);

      transport.on('data', cb);
    } else {
      transport.on(event, callback as any);
    }
  };

  const off: MCom['off'] = (event, callback) => {
    if (!transport.off) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'off`));
    }

    if (event === 'data') {
      const idx = mcomCallbacks.indexOf(callback);
      if (idx >= 0) {
        transport.off('data', transportCallbacks[idx]);
        transportCallbacks.splice(idx, 1);
        mcomCallbacks.splice(idx, 1);
      }
    } else {
      transport.off(event, callback as any);
    }
  }

  const request = async (msg: McomMessage, ctx?: Record<string,any>) => {
    if (!transport.request) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'request'`));
    } else {
      return await transport.request(protocol.encode(msg), ctx);
    }
  };

  const respond: MCom['respond'] = async (callback) => {
    if (!transport.respond) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'respond'`));
    } else {
      transport.respond((data, ctx) => callback(protocol.decode(data) as any, ctx as any) as any);
    }
  };
  
  return {
    emit, on, off,
    request, respond,
    connect: transport.connect,
    disconnect: transport.disconnect,
    list: transport.list
  };
}
