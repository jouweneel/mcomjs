import { Callbacks, Emitter } from './types'
import { keys } from 'ramda'

export const find = <T> (
  compare: (rec: T) => boolean,
  data: T[]
): T => {
  for (let i = 0; i < data.length; i++) {
    const rec = data[i];
    if (compare(rec) === true) {
      return rec;
    }
  }
  return null;
}

export const mapObjIndexed = (
  fn: (elm: any) => any,
  input: Object
) => {
  const output = {};
  Object.entries(input).map((v, k) => {
    output[k] = fn(v);
  });
  return output;
}

export const path = (
  p: string[],
  input: any,
  or?: any
) => {
  const nextNode = (remaining: string[], node: any) => {
    if (remaining.length === 0 && node) {
      return node;
    } else {
      if (typeof node !== 'object') {
        return or || null;
      }
      const [ key, ...rest] = remaining;
      return node[key] ? nextNode(rest, node[key]) : or || null;
    }
  }
  return nextNode(p, input);
}

export const propEq = (
  key: string | number, val: any
) => (
  rec: Record<string | number, any>
) => rec[key] === val;

export const emitter = (): Emitter => {
  const callbacks: Callbacks = {};

  const emit: Emitter['emit'] = (event, ...args) => {
    for (const cb of callbacks[event] || []) {
      cb(...args);
    }
    if (callbacks['any']) {
      for (const cb of callbacks['any'] || []) {
        cb(...args);
      }
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

  const offAll: Emitter['offAll'] = () => {
    for (const event of keys(callbacks)) {
      delete callbacks[event];
    }
  }

  const stop: Emitter['stop'] = (event) => {
    delete callbacks[event];
  }

  return {
    emit,
    on,
    off,
    offAll,
    stop
  }
}
