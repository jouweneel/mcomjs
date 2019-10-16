import { c2b, t2bs, sizeFactor } from './bytecodes'
import { BM, BMtype, BMclass } from './types'

const buildHeader = (
  cls: BMclass = 'sys', key: string, type: BMtype, size: number, data: any
): { dataSize: number, header: Buffer } => {
  const { byte, size: typeSize } = t2bs(type);
  const keySize = key.length + 1;
  let dataSize = (typeSize >= 0) ? typeSize : size;

  if (keySize > 255) { throw new Error(`Max key size is 255 (${key})`) };
  if (dataSize === null || dataSize === undefined) {
    try {
      dataSize = (type === 'json')
        ? JSON.stringify(data).length
        : data.length;
    } catch(e) {
      throw new Error(`Type ${type} needs a specified size`);
    }
  }
  if (typeSize < 0) {
    dataSize = dataSize * sizeFactor(type);
  }

  const headerSize = 2 + keySize + (typeSize >= 0 ? 1 : 5);
  const header = Buffer.alloc(headerSize, 0);

  header.writeUInt8(c2b(cls), 0);
  header.writeUInt8(keySize, 1);
  header.write(key, 2);
  header.writeUInt8(byte, keySize + 2);

  if (typeSize === -1) {
    header.writeUInt32LE(dataSize, keySize + 3);
  }

  return { dataSize, header };
}

const writeNr = (buf: Buffer, type: BMtype, data: number | bigint, offset: number = 0) => {
  switch(type) {
    case 'u8': buf.writeUInt8(data as number, offset); break;
    case 'u16': buf.writeUInt16LE(data as number, offset); break;
    case 'u32': buf.writeUInt32LE(data as number, offset); break;

    case 'i8': buf.writeInt8(data as number, offset); break;
    case 'i16': buf.writeInt16LE(data as number, offset); break;
    case 'i32': buf.writeInt32LE(data as number, offset); break;

    case 'float': buf.writeFloatLE(data as number, offset); break;
    case 'double': buf.writeDoubleLE(data as number, offset); break;
    default: throw new Error(`"${type}" is not a numeric type`);
  }
}
const writeNrArray = (buf: Buffer, type: BMtype, data: number[]) => {
  const elmType = type.slice(0, -2) as BMtype;
  for (let i = 0; i < data.length; i++) {
    writeNr(buf, elmType, data[i], i * sizeFactor(type));
  }
}

const writeDateTime = (buf: Buffer, type: BMtype, data: string) => {
  const i = (type === 'datetime') ? 4 : 0;
  let dt_time = '';

  switch(type) {
    case 'date': case 'datetime':
      const [ year, month, rest ] = data.split('-');
      buf.writeUInt16LE(parseInt(year, 10), 0); buf.writeUInt8(parseInt(month, 10), 2);
      if (type === 'date') {
        buf.writeUInt8(parseInt(rest, 10), 3);
        break;
      } else {
        const [ day, t ] = rest.split(' ');
        buf.writeUInt8(parseInt(day, 10), 3);
        dt_time = t;
      }
    case 'time':
      const time = dt_time || data;
      const [ hours, mins, s_ms ] = time.split(':');
      const [ secs, ms ] = s_ms.split('.');
      buf.writeUInt8(parseInt(hours, 10), i); buf.writeUInt8(parseInt(mins), i+1);
      buf.writeUInt8(parseInt(secs, 10), i+2); buf.writeUInt16LE(parseInt(ms, 10), i+3)
      break;
    default: throw new Error(`"${type}" is not a date/time format`);
  }
}

export const bm2buf = ({ cls, key, type, size, data }: BM): Buffer => {
  const { dataSize, header } = buildHeader(cls, key, type, size, data);

  const buf = Buffer.alloc(dataSize);
  switch(type) {
    case 'bool': buf.writeUInt8(data ? 1 : 0, 0); break;
    case 'char': buf.writeUInt8((data as string).charCodeAt(0), 0); break;

    case 'u8': case 'u16': case 'u32':
      case 'i8': case 'i16': case 'i32':
      case 'float': case 'double': writeNr(buf, type, data); break;

    case 'hsv': case 'rgb': case 'rgbw': writeNrArray(buf, 'u8[]', data); break;

    case 'date': case 'time': case 'datetime': writeDateTime(buf, type, data); break;

    case 'string': buf.write(data); break;
    case 'json': buf.write(JSON.stringify(data)); break;

    case 'bool[]': case 'u8[]': case 'u16[]': case 'u32[]':
      case 'i8[]': case 'i16[]': case 'i32[]':
      case 'float[]': case 'double[]': writeNrArray(buf, type, data); break;

    default: throw new Error(`bm2buf: Unknown BMtype ${type}`);
  }

  return Buffer.concat([ header, buf ]);
}

export const bms2buf = (bms: BM[]): Buffer => {
  return Buffer.concat(bms.map(bm2buf));
}
