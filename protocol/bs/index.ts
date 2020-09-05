import { bs2buf } from './bs2buf'
import { buf2bs } from './buf2bs'
import { McomProtocol } from '../../types'

export const Bs: McomProtocol = {
  encode: bs2buf,
  decode: buf2bs
}
