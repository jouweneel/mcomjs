import { b2ts, sizeFactor } from './bytecodes'
import { BM, BMtype } from './types'

const parseHeader = (
  buf: Buffer
): { cls: number, key: string, type: BMtype, size: number, offset: number } => {
  const cls = buf.readUInt8(0);
  const keySize = buf.readUInt8(1);
  const key = buf.slice(2, 1 + keySize).toString();
  const byte = buf.readUInt8(2 + keySize);
  const { type, size: typeSize } = b2ts(byte);

  let dataSize = (typeSize >= 0) ? typeSize : buf.readUInt32LE(3 + keySize);

  return {
    cls,
    key,
    type,
    size: dataSize,
    offset: (typeSize >= 0) ? keySize + 3 : keySize + 7
  }
}

const readNumber = (buf: Buffer, type: BMtype, offset: number = 0): number => {
  switch(type) {
    case 'u8': return buf.readUInt8(offset);
    case 'u16': return buf.readUInt16LE(offset);
    case 'u32': return buf.readUInt32LE(offset);

    case 'i8': return buf.readInt8(offset);
    case 'i16': return buf.readInt16LE(offset);
    case 'i32': return buf.readInt32LE(offset);

    case 'float': return buf.readFloatLE(offset);
    case 'double': return buf.readDoubleLE(offset);
  }
}

const readNumberArray = (buf: Buffer, type: BMtype) => {
  const elmType = type.slice(0, -2) as BMtype;
  const result: number[] = [];

  for (let i = 0; i < buf.length; i += sizeFactor(elmType)) {
    result.push(readNumber(buf, elmType, i));
  }
  switch(type) {
    case 'u8[]': return Uint8Array.from(result);
    case 'u16[]': return Uint16Array.from(result);
    case 'u32[]': return Uint32Array.from(result);
    case 'i8[]': return Int8Array.from(result);
    case 'i16[]': return Int16Array.from(result);
    case 'i32[]': return Int32Array.from(result);
    case 'float[]': return Float32Array.from(result);
    case 'double[]': return Float64Array.from(result);
    default: throw new Error(`Type ${type} is not an integer array type`);
  }
}

const readDateTime = (buf: Buffer, type: BMtype) => {
  const i = (type === 'datetime') ? 4 : 0;
  let output = '';
  switch(type) {
    case 'date': case 'datetime':
      const year = buf.readUInt16LE(0); const month = buf.readUInt8(2); const day = buf.readUInt8(2);
      output = `${year}-${month}-${day}`;
      if (type === 'date') {
        break;
      } else {
        output += ' ';
      }
    case 'time':
      const hours = buf.readUInt8(i); const mins = buf.readUInt8(i + 1); const secs = buf.readUInt8(i + 2);
      const ms = buf.readUInt16LE(i + 3);
      output += `${hours}:${mins}:${secs}.${ms}`;
  }
  return output;
}

const decodeBm = (buffer: Buffer, bufOffset: number = 0): BM => {
  const bmbuf = buffer.slice(bufOffset);
  const { cls, key, type, size, offset } = parseHeader(bmbuf);

  const buf = bmbuf.slice(offset, offset + size);
  
  let data: any = null;
  switch(type) {
    case 'bool': data = Boolean(buf.readUInt8(0)); break;
    case 'char': data = buf.toString(); break;
    case 'u8': case 'u16': case 'u32':
      case 'i8': case 'i16': case 'i32':
      case 'float': case 'double': data = readNumber(buf, type); break;
    case 'hsv' : case 'rgb' : case 'rgbw': data = readNumberArray(buf, 'u8[]'); break;
    case 'u8[]': case 'u16[]': case 'u32[]':
      case 'i8[]': case 'i16[]': case 'i32[]':
      case 'float[]': case 'double[]': data = readNumberArray(buf, type); break;
    
    case 'date': case 'time': case 'datetime': data = readDateTime(buf, type); break;
    case 'string': data = buf.toString(); break;
    case 'json': data = JSON.parse(buf.toString()); break;
    default: throw new Error(`buf2bm: Uknown BMtype ${type}`);
  }

  return {
    cls,
    key,
    type,
    data,
    size: offset + size
  }
}

export const buf2bm = (buf: Buffer): BM => {
  const { cls, key, type, data } = decodeBm(buf, 0);
  return { cls, key, type, data };
}

export const buf2bms = (buf: Buffer): BM[] => {
  const result = [];
  let offset = 0;

  while (offset < buf.length) {
    const { cls, key, type, data, size } = decodeBm(buf, offset);
    result.push({ cls, key, type, data });
    offset += size;
  }

  return result;
}
