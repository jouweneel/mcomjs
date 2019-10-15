export type BMtype =
  'key' |                                               // System reserved
  'bool' | 'char' |               // Basic

  'u8' | 'i8' | 'u16' |           // Unsigned integer
  'i16' | 'u32' | 'i32' |         // Integer
  'u8a' | 'i8a' | 'u16a' |        // ! Unsigned integer array
  'i16a' | 'u32a' | 'i32a' |      // ! Signed integer array
  'hsv' | 'rgb' | 'rgbw' |        // Color
  'date' | 'time' | 'datetime' |  // Date/time
  'string' | 'json'               // String formats

export interface BM {
  key: string
  data: any
  type: BMtype
  size?: number
}

const BMtypes: { byte: number, type: BMtype, size: number }[] = [
  { byte: 0x00, type: 'key', size: -1 },

  { byte: 0x11, type: 'bool', size: 1 },
  { byte: 0x12, type: 'char', size: 1 },

  { byte: 0x20, type: 'u8', size: 1 },
  { byte: 0x21, type: 'i8', size: 1 },
  { byte: 0x22, type: 'u16', size: 2 },
  { byte: 0x23, type: 'i16', size: 2 },
  { byte: 0x24, type: 'u32', size: 4 },
  { byte: 0x25, type: 'i32', size: 4 },

  { byte: 0x30, type: 'u8a', size: -1 },
  { byte: 0x31, type: 'i8a', size: -1 },
  { byte: 0x32, type: 'u16a', size: -1 },
  { byte: 0x33, type: 'i16a', size: -1 },
  { byte: 0x34, type: 'u32a', size: -1 },
  { byte: 0x35, type: 'i32a', size: -1 },
  
  { byte: 0x40, type: 'hsv', size: 3 },
  { byte: 0x41, type: 'rgb', size: 3 },
  { byte: 0x42, type: 'rgbw', size: 4 },

  { byte: 0x50, type: 'string', size: -1 },
  { byte: 0x51, type: 'date', size: 10 },     //YYYY-MM-DD
  { byte: 0x52, type: 'time', size: 9 },      //HH:SS:sss
  { byte: 0x53, type: 'datetime', size: 20 }, //YYYY-MM-DD HH:SS:sss

  { byte: 0x61, type: 'json', size: -1 }
]

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
