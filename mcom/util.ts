import { Callbacks, Emitter } from './types'

export const emitter = (): Emitter => {
  const callbacks: Callbacks = {};

  const emit: Emitter['emit'] = (event, data) => {
    for (const cb of callbacks[event]) {
      cb(data);
    }
  }

  const on: Emitter['on'] = (event, cb) => {
    callbacks[event] = callbacks[event] || [];
    callbacks[event].push(cb);
  }

  const off: Emitter['off'] = (event, cb) => {
    const idx = callbacks[event].indexOf(cb);
    callbacks[event].splice(idx, 1);
  }

  const stop: Emitter['stop'] = (event) => {
    delete callbacks[event];
  }

  return {
    emit,
    on,
    off,
    stop
  }
}
