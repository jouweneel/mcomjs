import * as protocols from './protocol'
import * as transports from './transport'

import { taglogger } from './logger'
import { Transports, TransportConfigs, TransportContexts } from './transport/types'
import { McomMessage, McomProtocol } from './types'
import { McomProtocolName } from './protocol/types'
export * from './util'

const logger = taglogger('MCom');
const toArray = (a: McomMessage | McomMessage[]): McomMessage[] => Array.isArray(a) ? a : [ a ];

export const MCom = async <T extends keyof Transports> (
  ptc: { protocol: McomProtocolName, transport: T, config: TransportConfigs[T] }
) => {
  const protocol: McomProtocol = protocols[ptc.protocol];
  const transport = await (transports as Transports)[ptc.transport](ptc.config as any);

  type Context = TransportContexts[T];

  const emit = async (msg: McomMessage | McomMessage[], ctx?: Context) => {
    if (!transport.emit) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'emit'`));
    } else {
      return await transport.emit(protocol.encode(toArray(msg)), ctx);
    }
  };

  const on = async (callback: (msgs: McomMessage[], ctx?: Context) => void) => {
    if (!transport.on) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'on'`));
    } {
      transport.on((data, ctx) => {
        callback(protocol.decode(data) as any, ctx as any);
      });
    }
  };

  const request = async (msg: McomMessage | McomMessage[], ctx?: Context) => {
    if (!transport.request) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'request'`));
    } else {
      return await transport.request(protocol.encode(toArray(msg)), ctx);
    }
  };

  const respond = async (callback: (msgs: McomMessage[], ctx?: Context) => void) => {
    if (!transport.respond) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'respond'`));
    } else {
      transport.respond((data, ctx) => callback(protocol.decode(data) as any, ctx as any) as any);
    }
  };
  
  return { emit, on, request, respond, start: transport.start, stop: transport.stop };
}
