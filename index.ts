import * as protocols from './protocol'
import * as transports from './transport'

import { taglogger } from './logger'
import { Mcom, McomProtocol } from './types'
import { Transport } from './transport/types'
export * from './util'

export type ProtocolKey = keyof (typeof protocols);
export type TransportKey = keyof (typeof transports);

const logger = taglogger('MCom');

export const MCom = async (
  ptc: { protocol: keyof (typeof protocols), transport: keyof (typeof transports), config: Record<string,any> }
): Promise<Mcom> => {
  const protocol: McomProtocol = protocols[ptc.protocol];
  const transport: Transport<unknown> = await (transports)[ptc.transport](ptc.config as any);

  const emit: Mcom['emit'] = async (msg, ctx) => {
    if (!transport.emit) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'emit'`));
    } else {
      return await transport.emit(protocol.encode(msg), ctx);
    }
  };

  const on: Mcom['on'] = async (event, callback) => {
    if (!transport.on) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'on'`));
    } 
    
    if (event === 'data') {
      transport.on('data', (data, ctx) => {
        callback(protocol.decode(data), ctx)
      });
    } else {
      transport.on(event, callback as any);
    }
  };

  const request: Mcom['request'] = async (msg, ctx) => {
    if (!transport.request) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'request'`));
    } else {
      return await transport.request(protocol.encode(msg), ctx);
    }
  };

  const respond: Mcom['respond'] = async (callback) => {
    if (!transport.respond) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'respond'`));
    } else {
      transport.respond((data, ctx) => callback(protocol.decode(data) as any, ctx as any) as any);
    }
  };
  
  return { emit, on, request, respond, connect: transport.connect, disconnect: transport.disconnect, list: transport.list };
}
