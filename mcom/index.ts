import * as protocols from '../protocol'
import * as transports from '../transport'

import { ProtocolTypes } from '../protocol/types'
import { Transports, TransportConfigs, TransportContexts } from '../transport/types'
import { taglogger } from '../logger'

const logger = taglogger('MCom');

export const MCom = async <P extends keyof ProtocolTypes, T extends keyof Transports> (
  ptc: { protocol: P, transport: T, config: TransportConfigs[T] }
) => {
  const protocol = protocols[ptc.protocol];
  const transport = await (transports as Transports)[ptc.transport](ptc.config as any);

  type Context = TransportContexts[T]
  type Input = ProtocolTypes[P]

  const emit = async (data: Input, ctx?: Context) => {
    if (!transport.emit) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'emit'`));
    } else {
      return transport.emit(protocol.encode(data as any), ctx);
    }
  };

  const on = async (callback: (data: Input, ctx?: Context) => void) => {
    if (!transport.on) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'on'`));
    } else {
      return transport.on((data, ctx) => callback(protocol.decode(data) as any, ctx as any));
    }
  };

  const request = async (data: Input, ctx?: Context) => {
    if (!transport.request) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'request'`));
    } else {
      return transport.request(protocol.encode(data as any), ctx);
    }
  };

  const respond = async (callback: (data: Input, ctx?: Context) => void) => {
    if (!transport.respond) {
      logger.error(new Error(`Transport "${ptc.transport}" does not implement 'respond'`));
    } else {
      return transport.respond((data, ctx) => callback(protocol.decode(data) as any, ctx as any) as any);
    }
  };
  
  return { emit, on, request, respond };
}
