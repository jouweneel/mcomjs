import { Protocol } from '../types'

export const Buf: Protocol<Buffer> = {
  decode: buf => buf,
  encode: data => data
}
