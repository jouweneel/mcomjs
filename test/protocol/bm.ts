import { Bm } from '../../protocol'
import { BM } from '../../protocol/types'

const test: BM[] = [
  { key: 'bm_bool', type: 'bool', data: true, cls: 'cmd' },
  { key: 'bm_char', type: 'char', data: 'a', cls: 'data' },

  { key: 'bm_u8', type: 'u8', data: 1, cls: 'state' },
  { key: 'bm_u16', type: 'u16', data: 256 },
  { key: 'bm_u32', type: 'u32', data: 65537 },

  { key: 'bm_i8', type: 'i8', data: -1 },
  { key: 'bm_i16', type: 'i16', data: -256 },
  { key: 'bm_i32', type: 'i32', data: -65537 },

  { key: 'bm_float', type: 'float', data: 3.14 },
  { key: 'bm_double', type: 'double', data: 4.15 },

  { key: 'bm_u8[]', type: 'u8[]', data: Uint8Array.from([1, 2]) },
  { key: 'bm_u16[]', type: 'u16[]', data: [ 256, 257 ] },
  { key: 'bm_u32[]', type: 'u32[]', data: [ 65537, 65538 ] },

  { key: 'bm_i8[]', type: 'i8[]', data: [-1, 1] },
  { key: 'bm_i16[]', type: 'i16[]', data: [ -256, 256 ] },
  { key: 'bm_i32[]', type: 'i32[]', data: [ -65537, 65537 ] },

  { key: 'bm_float', type: 'float[]', data: [3.14, 3.15] },
  { key: 'bm_double', type: 'double[]', data: [4.15, 5.16] },

  { key: 'bm_hsv', type: 'hsv', data: [0, 128, 255] },
  { key: 'bm_rgb', type: 'rgb', data: [ 255, 0, 128 ] },
  { key: 'bm_rgbw', type: 'rgbw', data: [ 0, 128, 255, 64 ] },

  { key: 'bm_date', type: 'date', data: '2019-10-11' },
  { key: 'bm_time', type: 'time', data: '15:31:48.123' },
  { key: 'bm_datetime', type: 'datetime', data: '2019-11-12 17:25:13.456' },

  { key: 'bm_string', type: 'string', data: 'GOEIEMOGGEL!' },
  { key: 'bm_json', type: 'json', data: { dingen: 'en sjit'} }
]

const buf = Bm.encode(test);
console.log(`Encoded (${buf.length} bytes):`, buf);
const decoded = Bm.decode(buf);
console.log('Decoded:', decoded);
