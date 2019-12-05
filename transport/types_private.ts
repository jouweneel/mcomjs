export interface Transport<T> {
  emit?: (data: Buffer, ctx?: T ) => Promise<number>
  on?: (callback: (data: Buffer, ctx?: T) => void) => void
  request?: (data: Buffer, ctx?: T) => Promise<Buffer>
  respond?: (respond: (data: Buffer, ctx?: T) => Buffer) => void
  stop?: () => Promise<any>
  start?: () => Promise<any>
}

export type TransportFn<C,T> = (cfg: C) => Promise<T>
export type Sub<T> = (data: Buffer, ctx?: T) => void
