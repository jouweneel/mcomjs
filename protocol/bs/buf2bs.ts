import { mapObjIndexed } from 'ramda'

import { bs2t } from './bytecodes'
import { BsMessage, BsSchema, BsSchemaEntry, BsDataType } from './types'

const bufReadArray = (buf: Buffer, method: string, bytes: number) => {
  const result = [];
  for (let i = 0; i < (buf.length / bytes); i++) {
    result[i] = buf[method](bytes * i);
  }
  return result;
}

const buf2data = (buf: Buffer, node: BsSchemaEntry): any => {
  if (!buf.length) {
    return null;
  }

  const type = node.type;
  const typeCode = bs2t(type);

  if (typeCode < 0x10) {
    return buf;
  }

  switch(type) {
    case 'u8': case 'bool': case 'char': return buf.readUInt8(0);
    case 'u16': return buf.readUInt16LE(0);
    case 'u32': return buf.readUInt32LE(0);
    case 'u64': return buf.readBigUInt64LE(0);

    case 'i8': return buf.readInt8(0);
    case 'u16': return buf.readInt16LE(0);
    case 'u32': return buf.readInt32LE(0);
    case 'u64': case 'timestamp': return buf.readBigInt64LE(0);

    case 'float': return buf.readFloatLE(0);
    case 'double': return buf.readDoubleLE(0);

    case 'u8[]': case 'bool[]': case 'rgb': case 'hsv': case 'rgbw':
      return bufReadArray(buf, 'readUInt8', 1);
    case 'u16[]': return bufReadArray(buf, 'readUInt16', 2);
    case 'u32[]': return bufReadArray(buf, 'readUInt32', 4);
    case 'u64[]': case 'timestamp[]': return bufReadArray(buf, 'readBigUInt64', 8);

    case 'i8[]': return bufReadArray(buf, 'readInt8', 1);
    case 'i16[]': return bufReadArray(buf, 'readInt16', 2);
    case 'i32[]': return bufReadArray(buf, 'readInt32', 4);
    case 'i64[]': return bufReadArray(buf, 'readBigInt64', 8);

    case 'float[]': return bufReadArray(buf, 'readFloatLE', 4);
    case 'double[]': return bufReadArray(buf, 'readDoubleLE', 8);

    case 'rgb[]': case 'hsv[]': case 'rgbw[]':  {
      const data = [];
      const mul = (type === 'rgbw[]') ? 4 : 3;
      for (let i = 0; i < (buf.length / mul); i++) {
        data[i] = [];
        for (let j = 0; j < mul; j++) {
          data[i][j] = buf.readUInt8(i * mul + j);
        }
      }
      return data;
    }

    case 'string': return buf.toString();
    case 'json': return JSON.parse(buf.toString());
  }
}

export const buf2bs = (schema: BsSchema) => (buf: Buffer): BsMessage => {
  const unitSize = (buf[0] & 0xf0) >> 4;
  const isArray = (buf[0] & 0x08) == 0x08;

  const dataLength = isArray ? buf.readUInt16LE(2) : 1;
  const dataSize = dataLength * unitSize;

  const nodeBytes = buf.slice(isArray ? 4 : 2, -dataSize);
  let node: Partial<BsSchemaEntry> = schema;
  const nodePath: string[] = [];
  for (let i = 0; i < nodeBytes.length; i++) {
    mapObjIndexed((entry: BsSchemaEntry, key) => {
      if (entry.id == nodeBytes[i]) {
        node = entry;
        nodePath.push(key);
      }
    }, node);
  }

  return {
    path: nodePath,
    node: node as BsSchemaEntry,
    data: buf2data(buf.slice(-dataSize), node as BsSchemaEntry)
  }
}
