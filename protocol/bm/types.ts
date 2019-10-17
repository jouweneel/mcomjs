export type BMtype =
/** Single value types */
  'bool' | 'char' |               // Basic

  'u8' | 'u16' | 'u32' |          // Unsigned integer
  'i8' | 'i16' | 'i32' |          // Signed integer
  'float' | 'double' |            // Float

/** Fixed size array types */
  'hsv' | 'rgb' | 'rgbw' |        // Predefined size arrays
  'date' | 'time' | 'datetime' |  // Date/time u16(Y), u8(M), u8(D), u8(h), u8(m), u8(s), u16(ms)]

/** Variable size array types */
  'bool[]' | 'string' | 'json' |  // Basic

  'u8[]' | 'u16[]' | 'u32[]' |    // Unsigned integer array
  'i8[]' | 'i16[]' | 'i32[]' |    // Signed integer array
  'float[]' | 'double[]'          // Float array

export interface BM {
  cls?: number
  key: string
  data: any
  type: BMtype
  size?: number
}
