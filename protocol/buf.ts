import { McomProtocol } from '../types'

export const Buf: McomProtocol = {
  decode: buf => ({ data: buf ? buf : null }),
  encode: ({ data }) => data || Buffer.from([])
}
