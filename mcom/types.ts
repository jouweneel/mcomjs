type CallbackFn = (data?: any) => void

export interface Callbacks {[event: string]: CallbackFn[] }

export interface Emitter {
  emit: (event: string, data?: any) => void
  on: (event: string, cb: CallbackFn) => void
  off: (event: string, cb: CallbackFn) => void
  stop: (event: string) => void
}
