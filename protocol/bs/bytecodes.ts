import { BsDataType } from './types'

export const BsDataTypes: BsDataType[] = []
BsDataTypes[0x00] = 'void'

/** 1-byte types */
BsDataTypes[0x10] = 'u8'
BsDataTypes[0x11] = 'i8'
BsDataTypes[0x12] = 'bool'
BsDataTypes[0x13] = 'char'

/** 1-byte array types */
BsDataTypes[0x18] = 'u8[]'
BsDataTypes[0x19] = 'i8[]'
BsDataTypes[0x1a] = 'bool[]'
BsDataTypes[0x1b] = 'string'
BsDataTypes[0x1c] = 'json'

/** 2-byte types */
BsDataTypes[0x20] = 'u16'
BsDataTypes[0x21] = 'i16'

/** 2-byte array types */
BsDataTypes[0x28] = 'u16[]'
BsDataTypes[0x29] = 'i16[]'

/** 3-byte types */
BsDataTypes[0x30] = 'rgb'
BsDataTypes[0x31] = 'hsv'

/** 3-byte array types */
BsDataTypes[0x38] = 'rgb[]'
BsDataTypes[0x39] = 'hsv[]'

/** 4-byte types */
BsDataTypes[0x40] = 'u32'
BsDataTypes[0x41] = 'i32'
BsDataTypes[0x42] = 'float'
BsDataTypes[0x43] = 'timestamp'

/** 4-byte array types */
BsDataTypes[0x48] = 'u32[]'
BsDataTypes[0x49] = 'i32[]'
BsDataTypes[0x4a] = 'float[]'
BsDataTypes[0x4b] = 'timestamp[]'

/** 8-byte types */
BsDataTypes[0x80] = 'u64'
BsDataTypes[0x81] = 'i64'
BsDataTypes[0x82] = 'double'

/** 8-byte array types */
BsDataTypes[0x88] = 'u64[]'
BsDataTypes[0x89] = 'i64[]'
BsDataTypes[0x8a] = 'double[]'

const bs2tMap = BsDataTypes.reduce((acc, v, k) => ({ ...acc, [v]: k }), {});

export const t2bs = (type: number) => BsDataTypes[type];
export const bs2t = (bs: BsDataType): number => bs2tMap[bs];
