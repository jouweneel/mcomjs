import { bms2buf } from './bm2buf'
import { buf2bms } from './buf2bm'
import { BM } from './types'
import { Protocol } from '../types'
import { taglogger } from '../../logger'

const logger = taglogger('protocol-bm');

export const Bm: Protocol<BM[]> = {
  decode: data => {
    try {
      return buf2bms(data);
    } catch(e) {
      logger.error(e);
    }
  },
  encode: bms => {
    try {
      return bms2buf(bms);
    } catch(e) {
      logger.error(e);
    }
  }
}
