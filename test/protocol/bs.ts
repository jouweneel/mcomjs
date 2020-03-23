import { Bs } from '../../protocol'
import { BsMessage, BsSchema } from '../../protocol/types'

const schema : BsSchema = {
  strip: {
    _id: 0x00, _type: 'custom', _cls: 0xa0,

    power: { _id: 0x00, _type: 'bool', _cls: 0x10 },
    brightness: { _id: 0x01, _type: 'u8', _cls: 0x10 },
    color: { _id: 0x02, _type: 'hsv', _cls: 0x10 },
    colors: { _id: 0x03, _type: 'rgb[]', _cls: 0x10, _length: 2 }
  },
  strip_2: {
    _id: 0x01, _type: 'custom', _cls: 0xa0,

    power: { _id: 0x00, _type: 'bool', _cls: 0x10 },
    brightness: { _id: 0x01, _type: 'u8', _cls: 0x10 },
    color: { _id: 0x02, _type: 'hsv', _cls: 0x10 }
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

