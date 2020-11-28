import { TransportEvent } from './transport/types'

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
  cmd?: number | string
  data?: any
  type?: DataType
}

export interface McomProtocol {
  decode: (buf: Buffer) => McomMessage
  encode: (msg: McomMessage) => Buffer
}

type McomOn = <E extends TransportEvent> (event: E, callback: E extends 'data'
  ? (msg: McomMessage, ctx?: Record<string,any>) => void
  : (ctx?: Record<string,any>) => void
) => Promise<void>

export interface Mcom {
  emit?: (msg: McomMessage, ctx?: Record<string,any>) => Promise<number>
  on?: McomOn
  request?: (msg: McomMessage, ctx?: Record<string,any>) => Promise<Buffer>
  respond?: (callback: (msg: McomMessage, ctx?: Record<string,any>) => void) => Promise<void>

  connect?: (ctx?: Record<string,any>) => Promise<void>
  disconnect?: (ctx?: Record<string,any>) => Promise<void>

  list?: () => Promise<Record<string,any>[]>
}

type CallbackFn = (...args: any) => void
export type AnyCallbackFn = (event: string, ...args: any) => void
export interface Callbacks {[event: string]: CallbackFn[] }

export interface Emitter {
  emit: (event: string, ...args: any) => void
  on: (event: string, cb: CallbackFn) => void
  onAny: (cb: AnyCallbackFn) => void
  off: (event: string, cb: CallbackFn) => void
  offAny: (cb: AnyCallbackFn) => void
  reset: (event?: string) => void
}

export type McomCallback <Event extends TransportEvent> =
  Event extends 'data' ? (msg: McomMessage, ctx?: Record<string,any>) => void :
  (ctx?: Record<string,any>) => void

type McomOnOff = <Event extends TransportEvent> (
  event: Event, callback: McomCallback<Event>
) => void

export interface MCom {
  emit?: (msg: McomMessage, ctx?: Record<string,any>) => Promise<number>
  on?: McomOnOff
  off?: McomOnOff
  request?: (msg: McomMessage, ctx?: Record<string,any>) => Promise<Buffer>
  respond?: (callback: (msg: McomMessage, ctx?: Record<string,any>) => Promise<void>) => void
  connect?: () => Promise<void>
  disconnect?: () => Promise<void>
  list?: () => Promise<Record<string,any>[]>
}
