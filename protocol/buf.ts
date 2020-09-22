import { McomProtocol } from '../types'

export const Buf: McomProtocol = {
  decode: buf => ([{ data: buf ? buf : null }]),
  encode: msgs => Buffer.concat([...msgs.map(({ data }) => data ? data : Buffer.from([]))])
}
