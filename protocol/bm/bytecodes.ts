import { BMtype } from './types'

const BMtypes: { byte: number, type: BMtype, size: number }[] = [
/** Single value types */
  { byte: 0x10, type: 'bool', size: 1 },
  { byte: 0x11, type: 'char', size: 1 },

  { byte: 0x20, type: 'u8', size: 1 },
  { byte: 0x21, type: 'u16', size: 2 },
  { byte: 0x22, type: 'u32', size: 4 },

  { byte: 0x28, type: 'i8', size: 1 },
  { byte: 0x29, type: 'i16', size: 2 },
  { byte: 0x2a, type: 'i32', size: 4 },

  { byte: 0x30, type: 'float', size: 4 },
  { byte: 0x31, type: 'double', size: 8 },

/** Fixed size array types */
  { byte: 0x50, type: 'hsv', size: 3 },
  { byte: 0x51, type: 'rgb', size: 3 },
  { byte: 0x52, type: 'rgbw', size: 4 },

  { byte: 0x60, type: 'date', size: 4 },
  { byte: 0x61, type: 'time', size: 5 },
  { byte: 0x62, type: 'datetime', size: 9 },

/** Variable size array types */
  { byte: 0x80, type: 'bool[]', size: -1 },
  { byte: 0x81, type: 'string', size: -1 },
  { byte: 0x82, type: 'json', size: -1 },

  { byte: 0xa0, type: 'u8[]', size: -1 },
  { byte: 0xa1, type: 'u16[]', size: -1 },
  { byte: 0xa2, type: 'u32[]', size: -1 },

  { byte: 0xa8, type: 'i8[]', size: -1 },
  { byte: 0xa9, type: 'i16[]', size: -1 },
  { byte: 0xaa, type: 'i32[]', size: -1 },

  { byte: 0xb0, type: 'float[]', size: -1 },
  { byte: 0xb1, type: 'double[]', size: -1 },
]

const x8Sizes = ['double', 'double[]'];
const x4Sizes = ['u32', 'i32', 'float', 'u32[]', 'i32[]', 'float[]'];
const x2Sizes = ['u16', 'i16', 'u16[]', 'i16[]'];

export const sizeFactor = (type: BMtype) => (
  x8Sizes.indexOf(type) >= 0 ? 8 :
  x4Sizes.indexOf(type) >= 0 ? 4 :
  x2Sizes.indexOf(type) >= 0 ? 2 :
  1
);

const b2tMap = BMtypes.reduce(
  (acc, { byte, type }) => acc.set(byte, type),
  new Map<number, BMtype>()
);
const b2tsMap = BMtypes.reduce(
  (acc, { byte, type, size }) => acc.set(byte, { type, size }),
  new Map<number, {type: BMtype, size: number}>()
);

const t2bMap = BMtypes.reduce(
  (acc, { type, byte }) => acc.set(type, byte),
  new Map<BMtype, number>()
);
const t2bsMap = BMtypes.reduce(
  (acc, { byte, type, size }) => acc.set(type, { byte, size }),
  new Map<BMtype, {byte: number, size: number}>()
);

export const b2t = b2tMap.get.bind(b2tMap);
export const b2ts = b2tsMap.get.bind(b2tsMap);
export const t2b = t2bMap.get.bind(t2bMap);
export const t2bs = t2bsMap.get.bind(t2bsMap);
