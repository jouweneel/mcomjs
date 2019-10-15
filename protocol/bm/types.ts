export type BMclass =
  'sys' |
  'cmd' |
  'data' |
  'state'

// @TODO add float/double support
export type BMtype =
  'bool' | 'char' |               // Basic

  'u8' | 'i8' | 'u16' |           // Unsigned integer
  'i16' | 'u32' | 'i32' |         // Integer
  'u8a' | 'i8a' | 'u16a' |        // ! Unsigned integer array
  'i16a' | 'u32a' | 'i32a' |      // ! Signed integer array
  'hsv' | 'rgb' | 'rgbw' |        // Color
  'date' | 'time' | 'datetime' |  // Date/time
  'string' | 'json'               // String formats

export interface BM {
  cls?: BMclass
  key: string
  data: any
  type: BMtype
  size?: number
}
