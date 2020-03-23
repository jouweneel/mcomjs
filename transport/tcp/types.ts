import { Socket } from 'net'

export interface TcpConfig {
  ip?: string
  port: number
  type: 'server' | 'client'
}

export interface TcpContext {
  ip: string
  port: number
  socket: Socket
}
