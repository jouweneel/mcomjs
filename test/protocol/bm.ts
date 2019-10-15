import { bm2buf, buf2bm, bms2buf, buf2bms } from '../../protocol'
import { BM } from '../../protocol/types'

const test: BM[] = [
  { key: 'bm_bool', type: 'bool', data: true, cls: 'cmd' },
  { key: 'bm_char', type: 'char', data: 'a', cls: 'data' },
  { key: 'bm_u8', type: 'u8', data: 1, cls: 'state' },
  { key: 'bm_i8', type: 'i8', data: -1 },
  { key: 'bm_u16', type: 'u16', data: 256 },
  { key: 'bm_i16', type: 'i16', data: -256 },
  { key: 'bm_u32', type: 'u32', data: 65537 },
  { key: 'bm_i32', type: 'i32', data: -65537 },
  { key: 'bm_u8a', type: 'u8a', data: Uint8Array.from([1, 2]) },
  { key: 'bm_i8a', type: 'i8a', data: [-1, 1] },
  { key: 'bm_u16a', type: 'u16a', data: [ 256, 257 ] },
  { key: 'bm_i16a', type: 'i16a', data: [ -256, 256 ] },
  { key: 'bm_u32a', type: 'u32a', data: [ 65537, 65538 ] },
  { key: 'bm_i32a', type: 'i32a', data: [ -65537, 65537 ] },
  { key: 'bm_hsv', type: 'hsv', data: [0, 128, 255] },
  { key: 'bm_rgb', type: 'rgb', data: [ 255, 0, 128 ] },
  { key: 'bm_rgbw', type: 'rgbw', data: [ 0, 128, 255, 64 ] },
  { key: 'bm_date', type: 'date', data: '2019-10-15' },
  { key: 'bm_time', type: 'time', data: '16:27:123' },
  { key: 'bm_datetime', type: 'datetime', data: '2019-10-15 16:28:123' },
  { key: 'bm_string', type: 'string', data: 'GOEIEMOGGEL!' },
  { key: 'bm_json', type: 'json', data: { dingen: 'en sjit'} }
]

for (const bm of test) {
  const buf = bm2buf(bm);

  const parsed = buf2bm(buf);
  console.log('\n');
  console.log(bm);
  console.log(buf);
  console.log(parsed);
}

const buf = bms2buf(test);
console.log('THE MEGABUF', buf);
const parsed = buf2bms(buf) as BM[];
console.log('THE MEGAPARSE', parsed);
