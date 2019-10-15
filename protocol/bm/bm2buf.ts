import { t2b, t2bs, BM, BMtype } from './types'

const mul = (type: BMtype) => (
  (type === 'u32' || type === 'i32' || type === 'u32a' || type === 'i32a') ? 4 :
  (type === 'u16' || type === 'i16' || type === 'u16a' || type === 'i16a') ? 2 :
  1
);

const buildHeader = (
  key: string, type: BMtype, size: number, data: any
): { dataSize: number, header: Buffer } => {
  const { byte, size: typeSize } = t2bs(type);
  const keySize = key.length;
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
    dataSize = dataSize * mul(type);
  }

  const headerSize = 2 + keySize + (typeSize >= 0 ? 1 : 5);
  const header = Buffer.alloc(headerSize, 0);

  header.writeUInt8(t2b('key'), 0);
  header.writeUInt8(keySize, 1);
  header.write(key, 2);
  header.writeUInt8(byte, keySize + 2);

  if (typeSize === -1) {
    header.writeUInt32LE(dataSize, keySize + 3);
  }

  return { dataSize, header };
}

const writeInt = (buf: Buffer, type: BMtype, data: number, offset: number = 0) => {
  switch(type) {
    case 'u8': buf.writeUInt8(data, offset); break;
    case 'u16': buf.writeUInt16LE(data, offset); break;
    case 'u32': buf.writeUInt32LE(data, offset); break;
    case 'i8': buf.writeInt8(data, offset); break;
    case 'i16': buf.writeInt16LE(data, offset); break;
    case 'i32': buf.writeInt32LE(data, offset); break;
    default: throw new Error(`"${type}" is not an integer type`);
  }
}
const writeIntA = (buf: Buffer, type: BMtype, data: number[]) => {
  const elmType = type.slice(0, -1) as BMtype;
  for (let i = 0; i < data.length; i++) {
    writeInt(buf, elmType, data[i], i * mul(type));
  }
}

export const bm2buf = ({ key, type, size, data }: BM): Buffer => {
  const { dataSize, header } = buildHeader(key, type, size, data);

  const buf = Buffer.alloc(dataSize);
  switch(type) {
    case 'bool': buf.writeUInt8(data ? 1 : 0, 0); break;
    case 'char': buf.writeUInt8((data as string).charCodeAt(0), 0); break;
    case 'u8': case 'u16': case 'u32': case 'i8': case 'i16': case 'i32': writeInt(buf, type, data); break;
    case 'u8a': case 'u16a': case 'u32a': case 'i8a': case 'i16a': case 'i32a': writeIntA(buf, type, data); break;
    case 'hsv': case 'rgb': case 'rgbw': writeIntA(buf, 'u8a', data); break;
    case 'string': case 'date': case 'time': case 'datetime': buf.write(data); break;
    case 'json': buf.write(JSON.stringify(data)); break;
    default: throw new Error(`bm2buf: Unknown BMtype ${type}`);
  }

  return Buffer.concat([ header, buf ]);
}

export const bms2buf = (bms: BM[]): Buffer => {
  return Buffer.concat(bms.map(bm2buf));
}
