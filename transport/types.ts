export * from './hm/types'

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

export type DualTransport<T> = EventTransport<T> & ReqResTransport<T>

export type TransportFn<T> = (cfg: any) => Promise<T>
