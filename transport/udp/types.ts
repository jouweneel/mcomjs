export interface UdpConfig {
  port: number
}

export interface UdpContext {
  ip: string
  port?: number
  broadcast?: boolean
}
