import { t2bs } from './bytecodes'
import { DataType, McomMessage, McomProtocol } from '../../types'

const bufReadArray = (
  buf: Buffer, method: string, ptr: number, len: number, bytes: number
) => {
  const result = [];
  for (let i = 0; i < len; i++) {
    result[i] = buf[method](ptr + bytes * i);
  }
  return result;
}

const readBufData = (
  buf: Buffer, type: DataType, ptr: number, len: number = 1
) => {
  switch(type) {
    case 'u8': case 'bool': case 'char': return buf.readUInt8(ptr);
    case 'u16': return buf.readUInt16LE(ptr);
    case 'u32': return buf.readUInt32LE(ptr);
    case 'u64': return buf.readBigUInt64LE(ptr);

    case 'i8': return buf.readInt8(ptr);
    case 'i16': return buf.readInt16LE(ptr);
    case 'i32': return buf.readInt32LE(ptr);
    case 'i64': case 'timestamp': return buf.readBigInt64LE(ptr);

    case 'float': return buf.readFloatLE(ptr);
    case 'double': return buf.readDoubleLE(ptr);

    case 'u8[]': case 'bool[]': case 'rgb': case 'hsv': case 'rgbw':
      return bufReadArray(buf, 'readUInt8', ptr, len, 1);
    case 'u16[]': return bufReadArray(buf, 'readUInt16LE', ptr, len, 2);
    case 'u32[]': return bufReadArray(buf, 'readUInt32LE', ptr, len, 4);
    case 'u64[]': case 'timestamp[]': return bufReadArray(buf, 'readBigUInt64LE', ptr, len, 8);

    case 'i8[]': return bufReadArray(buf, 'readInt8', ptr, len, 1);
    case 'i16[]': return bufReadArray(buf, 'readInt16LE', ptr, len, 2);
    case 'i32[]': return bufReadArray(buf, 'readInt32LE', ptr, len, 4);
    case 'i64[]': return bufReadArray(buf, 'readBigInt64LE', ptr, len, 8);

    case 'float[]': return bufReadArray(buf, 'readFloatLE', ptr, len, 4);
    case 'double[]': return bufReadArray(buf, 'readDoubleLE', ptr, len, 8);

    case 'rgb[]': case 'hsv[]': case 'rgbw[]':  {
      const data = [];
      const mul = (type === 'rgbw[]') ? 4 : 3;
      for (let i = 0; i < len; i++) {
        data[i] = [];
        for (let j = 0; j < mul; j++) {
          data[i][j] = buf.readUInt8(ptr + j + i * mul);
        }
      }
      return data;
    }

    case 'string': return buf.slice(ptr, ptr + len).toString();
    case 'json': return JSON.parse(buf.slice(ptr, ptr + len).toString());
  }
}

export const buf2bs: McomProtocol['decode'] = buf => {
  if (!buf.length) {
    return [];
  }
  
  const msgs: McomMessage[] = [];
  let ptr = 0;

  while (ptr < buf.length) {
    const typeCode = buf[ptr + 1];
    const unitSize = (typeCode & 0xf0) >> 4;

    const isArray = (typeCode & 0x08) == 0x08;
    const len = isArray ? buf.readUInt16LE(ptr + 2) : 1;
    const dataBytes = len * unitSize;

    const cmd = buf[ptr];
    const type = t2bs(typeCode);

    ptr += isArray ? 4 : 2;
    const data = readBufData(buf, type, ptr, len);
    ptr += dataBytes;

    msgs.push({ cmd, data, type });
  }

  return msgs;
}
