import * as protocols from './protocol'
import * as transports from './transport'

import { taglogger } from './logger'
import { McomMessage, McomProtocol } from './types'
import { TransportEvent } from './transport/types'
export * from './util'

const logger = taglogger('MCom');
const toArray = (a: McomMessage | McomMessage[]): McomMessage[] => Array.isArray(a) ? a : [ a ];

export const MCom = async (
  ptc: { protocol: keyof (typeof protocols), transport: keyof (typeof transports), config: Record<string,any> }
) => {
  const protocol: McomProtocol = protocols[ptc.protocol];
  const transport = await (transports)[ptc.transport](ptc.config as any);

  const emit = async (msg: McomMessage | McomMessage[], ctx?: Record<string,any>) => {
    if (!transport.emit) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'emit'`));
    } else {
      return await transport.emit(protocol.encode(toArray(msg)), ctx);
    }
  };

  const on = async <E extends TransportEvent> (
    event: E,
    callback: E extends 'data' ? (msgs: McomMessage[], ctx?: Record<string,any>) => void : (ctx?: Record<string,any>) => void
  ) => {
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

  const request = async (msg: McomMessage | McomMessage[], ctx?: Record<string,any>) => {
    if (!transport.request) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'request'`));
    } else {
      return await transport.request(protocol.encode(toArray(msg)), ctx);
    }
  };

  const respond = async (callback: (msgs: McomMessage[], ctx?: Record<string,any>) => void) => {
    if (!transport.respond) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'respond'`));
    } else {
      transport.respond((data, ctx) => callback(protocol.decode(data) as any, ctx as any) as any);
    }
  };
  
  return { emit, on, request, respond, connect: transport.connect, disconnect: transport.disconnect, list: transport.list };
}
