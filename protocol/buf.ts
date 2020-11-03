import { McomProtocol } from '../types'

export const buf: McomProtocol = {
  decode: b => ({ data: b ? b : null }),
  encode: ({ data }) => data || Buffer.from([])
}
