import { XudpClass } from './types'

const BMclasses: { byte: number, cls: XudpClass }[] = [
  { byte: 0x00, cls: 'event' },
  { byte: 0x10, cls: 'reqres' }
]

const b2cMap = BMclasses.reduce(
  (acc, { byte, cls }) => acc.set(byte, cls),
  new Map<number, string>()
);
const c2bMap = BMclasses.reduce(
  (acc, { byte, cls }) => acc.set(cls, byte),
  new Map<string, number>()
)

export const b2c = b2cMap.get.bind(b2cMap);
export const c2b = c2bMap.get.bind(c2bMap);
