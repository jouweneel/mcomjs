import { BM } from './bm/types'

export interface Protocol<T> {
  decode: (buf: Buffer) => T
  encode: (data: T) => Buffer
}

export type ProtocolTypes = {
  Bm: BM[]
  Buf: Buffer
}
