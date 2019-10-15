export type XudpClass =
  'event' |
  'reqres'

export interface XudpConfig {
  port: number
}

export interface XudpContext {
  ip: string
  port?: number
  broadcast?: boolean
  id?: number
  cls?: XudpClass
}
