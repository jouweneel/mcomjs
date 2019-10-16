export interface Transport<T> {
  emit?: (data: Buffer, ctx?: T ) => Promise<number>
  on?: (callback: (data: Buffer, ctx?: T) => void) => void
  request?: (data: Buffer, ctx?: T) => Promise<Buffer>
  respond?: (callback: (data: Buffer, ctx?: T) => void) => void
  stop?: () => Promise<any>
}

export type TransportFn<C,T> = (cfg: C) => Promise<T>
export type Sub<T> = (data: Buffer, ctx?: T) => void
