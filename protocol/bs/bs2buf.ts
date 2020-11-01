import { bs2t } from './bytecodes'
import { DataType, McomProtocol } from '../../types'

const bufWrite = (data: number, method: string, bytes: number) => {
  const buf = Buffer.alloc(bytes);
  buf[method](data);
  return buf;
}
const bufWriteArray = (data: number[], method: string, bytes: number) => {
  const buf = Buffer.alloc(bytes * data.length);
  for (let i = 0; i < data.length; i++) {
    buf[method](data[i], i * bytes);
  }
  return buf;
}

const data2buf = (
  data: any | any[],
  type: DataType
): Buffer => {
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
          buf.writeUInt8(elm[i], i + idx * elm.length);
        }
      }
      return buf;
    }

    case 'json': return Buffer.from(JSON.stringify(data));

    default: {
      console.log(`Type "${type}" not implemented, defaulting to Buffer.from!`);
      return Buffer.from(data);
    }
  }
}

export const bs2buf: McomProtocol['encode'] = ({ cmd, data, type }) => {
  const bsType = bs2t(type);
  const isArray = (bsType & 0x08) == 0x08;
  const dataLength = isArray ? type === 'json' ? JSON.stringify(data).length : (data as any[]).length : 1;
  const headerSize = isArray ? 4 : 2;

  const header = Buffer.alloc(headerSize);
  header.writeUInt8(cmd as number, 0);
  header.writeUInt8(bsType, 1);
  
  if (isArray) {
    header.writeUInt16LE(dataLength, 2);
  }

  return Buffer.concat([ header, data2buf(data || [], type) ]);
}
