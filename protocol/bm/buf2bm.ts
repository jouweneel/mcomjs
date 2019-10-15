import { b2c, b2ts } from './bytecodes'
import { BM, BMtype, BMclass } from './types'

const div = (type: BMtype) => (
  (type === 'u32' || type === 'i32' || type === 'u32a' || type === 'i32a') ? 4 :
  (type === 'u16' || type === 'i16' || type === 'u16a' || type === 'i16a') ? 2 :
  1
);

const parseHeader = (
  buf: Buffer
): { cls: BMclass, key: string, type: BMtype, size: number, offset: number } => {
  const cls = b2c(buf.readUInt8(0));
  const keySize = buf.readUInt8(1);
  const key = buf.slice(2, 2 + keySize).toString();
  const byte = buf.readUInt8(2 + keySize);
  const { type, size: typeSize } = b2ts(byte);

  let dataSize = (typeSize >= 0) ? typeSize : buf.readUInt32LE(2 + keySize + 1);

  return {
    cls,
    key,
    type,
    size: dataSize,
    offset: (typeSize >= 0) ? keySize + 3 : keySize + 7
  }
}

const readInt = (buf: Buffer, type: BMtype, offset: number = 0): number => {
  switch(type) {
    case 'u8': return buf.readUInt8(offset);
    case 'u16': return buf.readUInt16LE(offset);
    case 'u32': return buf.readUInt32LE(offset);
    case 'i8': return buf.readInt8(offset);
    case 'i16': return buf.readInt16LE(offset);
    case 'i32': return buf.readInt32LE(offset);
  }
}

const readIntA = (buf: Buffer, type: BMtype) => {
  const elmType = type.slice(0, -1) as BMtype;
  const result: number[] = [];

  for (let i = 0; i < buf.length; i += div(elmType)) {
    result.push(readInt(buf, elmType, i));
  }
  switch(type) {
    case 'u8a': return Uint8Array.from(result);
    case 'u16a': return Uint16Array.from(result);
    case 'u32a': return Uint32Array.from(result);
    case 'i8a': return Int8Array.from(result);
    case 'i16a': return Int16Array.from(result);
    case 'i32a': return Int32Array.from(result);
    default: throw new Error(`Type ${type} is not an integer array type`);
  }
}

const decodeBm = (buffer: Buffer, bufOffset: number = 0): BM => {
  const bmbuf = buffer.slice(bufOffset);
  const { cls, key, type, size, offset } = parseHeader(bmbuf);

  const buf = bmbuf.slice(offset, offset + size);
  
  let data: any = null;
  switch(type) {
    case 'bool': data = Boolean(buf.readUInt8(0)); break;
    case 'char': data = buf.toString(); break;
    case 'u8': case 'u16': case 'u32': case 'i8': case 'i16': case 'i32': data = readInt(buf, type); break;
    case 'u8a': case 'u16a': case 'u32a': case 'i8a': case 'i16a': case 'i32a': data = readIntA(buf, type); break;
    case 'hsv' : case 'rgb' : case 'rgbw': data = readIntA(buf, 'u8a'); break;
    case 'string': case 'date': case 'time': case 'datetime': data = buf.toString(); break;
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
