import { Bs } from '../../protocol'
import { BsMessage, BsSchema } from '../../protocol/types'

const schema : BsSchema = {
  strip: {
    id: 0x00, type: 'custom', group: 0xa0,

    power: { id: 0x00, type: 'bool', group: 0x10 },
    brightness: { id: 0x01, type: 'u8', group: 0x10 },
    color: { id: 0x02, type: 'hsv', group: 0x10 },
    colors: { id: 0x03, type: 'rgb[]', group: 0x10, length: 2 }
  },
  strip_2: {
    id: 0x01, type: 'custom', group: 0xa0,

    power: { id: 0x00, type: 'bool', group: 0x10 },
    brightness: { id: 0x01, type: 'u8', group: 0x10 },
    color: { id: 0x02, type: 'hsv', group: 0x10 }
  }
}

const msg: BsMessage = {
  path: ['strip', 'colors'],
  data: [[32, 64, 128], [64, 128, 255]]
}

const bs = Bs();
bs.setSchema(schema);
const buf = bs.encode(msg);
console.log('ENCODED', buf);
console.log('DECODED', bs.decode(buf));

