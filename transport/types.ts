export type TransportEvent = 'connect' | 'data' | 'disconnect'

type TransportCallback<E extends TransportEvent, Ctx = Record<string,any>> =
  E extends 'data' ? (data: Buffer, ctx?: Ctx) => void  // Buffer for req/res
  : (ctx?: Ctx) => void

type TransportOnOff<Ctx> = <E extends TransportEvent> (
  event: E,
  callback: TransportCallback<E, Ctx>
) => void;

export interface Transport <Ctx = Record<string,any>> {
  context?: boolean

  emit?: (data: Buffer, ctx?: Ctx) => Promise<number>
  on?: TransportOnOff<Ctx>
  off?: TransportOnOff<Ctx>

  request?: (data: Buffer, ctx?: Ctx) => Promise<Buffer>
  respond?: (responder: (data: Buffer, ctx?: Ctx) => Promise<Buffer>) => void

  connect?: () => Promise<void>
  disconnect?: (ctx?: Ctx) => Promise<void>
  list?: () => Promise<Record<string,any>[]>
}

export type TransportFn <Cfg = Record<string,any>, Ctx = Record<string,any>> = (
  cfg?: Cfg
) => Promise<Transport<Ctx>>
