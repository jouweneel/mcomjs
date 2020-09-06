export type DataType =
/** 0-byte unit types */
  'void' | 'custom' |

/** 1-byte unit types */
  'u8' | 'i8' | 'bool' | 'char' |
/** 1-byte unit array types */
  'u8[]' | 'i8[]' | 'bool[]' | 'string' | 'json' |

/** 2-byte unit types */
  'u16' | 'i16' |

/** 2-byte unit array types */
  'u16[]' | 'i16[]' |

/** 3-byte unit types */
  'rgb' | 'hsv' |

/** 3-byte unit array types */
  'rgb[]' | 'hsv[]' |

/** 4-byte unit types */
  'u32' | 'i32' | 'float' | 'rgbw' |

/** 4-byte unit array types */
  'u32[]' | 'i32[]' | 'float[]' | 'rgbw[]' |

/** 8-byte unit types */
  'u64' | 'i64' | 'timestamp' | 'double' |

/** 8-byte unit array types */
  'u64[]' | 'i64[]' | 'timestamp[]' | 'double[]'

export interface McomMessage {
  cmd?: string | number
  data?: any
  type?: DataType
}

export interface McomProtocol {
  decode: (buf: Buffer) => McomMessage[]
  encode: (msg: McomMessage[]) => Buffer
}

interface State {
  key: string
  value?: any
  type?: DataType
  ro?: boolean
}

export interface DeviceData {
  id: string
  name?: string
  state: State[]
  protocol: string
  transport: string
  config: Record<string,any>
  ctx?: Record<string,any>
}

type CallbackFn = (data?: any) => void
export interface Callbacks {[event: string]: CallbackFn[] }

export interface Emitter {
  emit: (event: string, data?: any) => void
  on: (event: string, cb: CallbackFn) => void
  off: (event: string, cb: CallbackFn) => void
  offAll: () => void
  stop: (event: string) => void
}
