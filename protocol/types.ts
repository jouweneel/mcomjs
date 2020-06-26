import { BM } from './bm/types'
import { EISCPMessage } from './eiscp/types'
export * from './bm/types'
export * from './bs/types'
export * from './eiscp/types'

export interface Protocol<T> {
  decode: (buf: Buffer) => T
  encode: (data: T) => Buffer
  [key: string]: any
}

export type ProtocolTypes = {
  Bm: BM[]
  Buf: Buffer
  EISCP: EISCPMessage
}
