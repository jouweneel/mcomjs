export * from './xudp/types'

/**
 * support:
 * - broadcast
 * - req/res and/or emit/on
 */

export interface EventTransport<T> {
  emit: (ctx: T, data?: Buffer) => Promise<number>
  on: (callback: (ctx: T, data?: Buffer) => void) => void
  stop: () => Promise<any>
}

export interface ReqResTransport<T> {
  request?: (ctx: T, data?: Buffer) => Promise<Buffer>
  respond?: (callback: (ctx: T, data?: Buffer) => void) => void
  stop?: () => Promise<any>
}

export type XTransport<T> = EventTransport<T> & ReqResTransport<T>

export type TransportFn<C,T> = (cfg: C) => Promise<T>

export type Sub<T> = (ctx: T, data?: Buffer) => void
