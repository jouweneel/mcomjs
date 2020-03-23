import { path } from 'ramda'

import { bs2t } from './bytecodes'
import { BsMessage, BsSchema, BsSchemaEntry, BsDataType } from './types'

const bufWrite = (data: number, method: string, bytes: number) => {
  const buf = Buffer.alloc(bytes);
  buf[method](data);
  return buf;
}
const bufWriteArray = (data: number[], method: string, bytes: number) => {
  const buf = Buffer.alloc(bytes * data.length);
  for (let i = 0; i < data.length; i++) {
    buf[method](data[i]);
  }
  return buf;
}

const data2buf = (data: any | any[], type: BsDataType, typeCode: number): Buffer => {
  /** No data */
  if (!data) {
    return Buffer.from([]);
  }

  switch(type) {
    case 'u8': case 'bool': case 'char': return Buffer.from([ data ]);
    case 'string': case 'u8[]': case 'bool[]': case 'rgb': case 'rgbw': case 'hsv':
      return Buffer.from(data);

    case 'u16': return bufWrite(data, 'writeUInt16LE', 2);
    case 'u32': return bufWrite(data, 'writeUInt32LE', 4);
    case 'u64' : case 'timestamp': return bufWrite(data, 'writeBigUInt64LE', 8);

    case 'i8': return bufWrite(data, 'writeInt8', 1);
    case 'i16': return bufWrite(data, 'writeInt16LE', 2);
    case 'i32': return bufWrite(data, 'writeInt32LE', 4);
    case 'i64': return bufWrite(data, 'writeBigInt64LE', 8);

    case 'float':  return bufWrite(data, 'writeFloatLE', 4);
    case 'double':  return bufWrite(data, 'writeDoubleLE', 8);
  
    case 'u16[]':  return bufWriteArray(data, 'writeUInt16LE', 2);
    case 'u32[]':  return bufWriteArray(data, 'writeUInt32LE', 4);
    case 'u64[]': case 'timestamp[]':  return bufWriteArray(data, 'writeBigUInt64LE', 8);
  
    case 'i8[]':  return bufWriteArray(data, 'writeInt8', 1);
    case 'i16[]':  return bufWriteArray(data, 'writeInt16LE', 2);
    case 'i32[]':  return bufWriteArray(data, 'writeInt32LE', 4);
    case 'i64[]':  return bufWriteArray(data, 'writeBigInt64LE', 8);

    case 'float[]':  return bufWriteArray(data, 'writeFloatLE', 4);
    case 'double[]':  return bufWriteArray(data, 'writeDoubleLE', 8);

    case 'rgb[]': case 'hsv[]': case 'rgbw[]': {
      const buf = Buffer.alloc(data[0].length * data.length);
      for (let idx = 0; idx < data.length; idx++) {
        const elm = data[idx];
        for (let i = 0; i < elm.length; i++) {
          buf.writeUInt8(elm[i], (elm.length * idx) + i);
        }
      }
      return buf;
    }

    case 'json': return Buffer.from(JSON.stringify(data));

    default: {
      if (typeCode >= 0x10) {
        console.log(`Type "${type}" not implemented, defaulting to Buffer.from!`);
      }
      return Buffer.from(data);
    }
  }
}

/**
 * | TYPE | CLS | (optional) LENGTH | [...PATH] | DATA |
*/
export const bs2buf = (schema: BsSchema) => (msg: BsMessage): Buffer => {
  const node = path<BsSchemaEntry>(msg.path, schema);
  if (!node) {
    return null;
  }
  const bsType = bs2t(node._type);
  const isArray = (bsType & 0x08) == 0x08;
  const dataLength = isArray ? (msg.data as any[]).length : 1;
  const headerSize = 2 + msg.path.length + (isArray ? 2 : 0);

  const header = Buffer.alloc(headerSize);
  let ptr = 0;
  header.writeUInt8(bsType, ptr);
  ptr++;

  header.writeUInt8(node._cls, ptr);
  ptr++;

  if (isArray) {
    header.writeUInt16LE(dataLength, ptr);
    ptr += 2;
  }

  for (let i = 0; i < msg.path.length; i++) {
    const _node = path<BsSchemaEntry>(msg.path.slice(0, i + 1), schema);
    header.writeUInt8(_node._id, ptr + i);
  }

  return Buffer.concat([ header, data2buf(msg.data, node._type, bsType) ]);
}
