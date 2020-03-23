import { find, mapObjIndexed, path, propEq } from 'ramda'

import { bs2t, t2bs, BsMessage, BsSchema, BsSchemaEntry } from './bytecodes'
import { BsDataType } from './types'

export const Bs = (initialSchema: BsSchema = {}) => {
  let schema = initialSchema;

  const bs2buf = (msg: BsMessage): Buffer => {
    const node = path<BsSchemaEntry>(msg.node, schema);
    if (!node) {
      return null;
    }
    const bsType = bs2t(node._type);
    const unitSize = (bsType & 0xf0) >> 4;
    const isArray = (bsType & 0x80) == 0x80;
    const dataLength = isArray ? (msg.data as any[]).length : 1;
    const dataSize = dataLength * unitSize;
    const headerSize = 2 + msg.node.length;

    const buf = Buffer.alloc(headerSize);
    let ptr = 0;
    buf.writeUInt8(bsType, ptr);
    ptr++;
    buf.writeUInt8(msg.cls || 0, ptr);
    ptr++;

    if (isArray) {
      buf.writeUInt16LE(dataLength, ptr);
      ptr += 2;
    }

    for (let i = 0; i < msg.node.length; i++) {
      const _node = path<BsSchemaEntry>(msg.node.slice(0, i + 1), schema);
      buf.writeUInt8(_node._id, ptr + i);
    }

    return msg.data ? Buffer.concat([ buf, Buffer.from(msg.data) ]) : buf;
  }

  const buf2bs = (buf: Buffer): BsMessage => {
    const unitSize = (buf[0] & 0xf0) >> 4;
    const isArray = (buf[0] & 0x80) == 0x80;
    const bsType = t2bs(buf[0]);

    const dataLength = isArray ? buf.readUInt16LE(2) : 1;
    const dataSize = dataLength * unitSize;

    const nodeBytes = buf.slice(isArray ? 4 : 2, -dataSize);
    let ref: Partial<BsSchemaEntry> = schema;
    const node: string[] = [];
    for (let i = 0; i < nodeBytes.length; i++) {
      mapObjIndexed((entry: BsSchemaEntry, key) => {
        if (entry._id == nodeBytes[i]) {
          ref = entry;
          node.push(key);
        }
      }, ref);
    }

    return {
      node,
      data: buf.slice(-dataSize),
      length: dataLength,
      cls: buf[1]
    }
  }

  return {
    getSchema: () => schema,
    setSchema: (newSchema: BsSchema) => schema = newSchema,
    decode: buf2bs,
    encode: bs2buf
  }
}

const schema : BsSchema = {
  strip: {
    _id: 0x00, _type: 'custom', _cls: 0xa0,

    power: { _id: 0x00, _type: 'bool', _cls: 0x10 },
    brightness: { _id: 0x01, _type: 'u8', _cls: 0x10 },
    color: { _id: 0x02, _type: 'hsv', _cls: 0x10 }
  },
  strip_2: {
    _id: 0x01, _type: 'custom', _cls: 0xa0,

    power: { _id: 0x00, _type: 'bool', _cls: 0x10 },
    brightness: { _id: 0x01, _type: 'u8', _cls: 0x10 },
    color: { _id: 0x02, _type: 'hsv', _cls: 0x10 }
  }
}

const msg: BsMessage = {
  node: ['strip_2', 'color'],
  data: [32, 64, 128],
  cls: 15
}

const bs = Bs(schema);
const buf = bs.encode(msg);
console.log(buf, bs.decode(buf));
