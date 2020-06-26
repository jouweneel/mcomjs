import { UdpConfig, UdpContext } from './udp/types'
import { XudpConfig, XudpContext } from './xudp/types'
import { Rs232Context, Rs232Config } from './rs232/types'
import { Transport, TransportFn } from './types_private'
import { HttpConfig, HttpContext } from './http/types'
import { TcpConfig, TcpContext } from './tcp/types'


export interface Transports {
  Http: TransportFn<HttpConfig, Transport<HttpContext>>
  Rs232: TransportFn<Rs232Config, Transport<Rs232Context>>
  Tcp: TransportFn<TcpConfig, Transport<TcpContext>>
  Udp: TransportFn<UdpConfig, Transport<UdpContext>>
  Xudp: TransportFn<XudpConfig, Transport<XudpContext>>
}

export interface TransportConfigs {
  Http: HttpConfig
  Rs232: Rs232Config
  Tcp: TcpConfig
  Udp: UdpConfig
  Xudp: XudpConfig
}

export interface TransportContexts {
  Http: HttpContext
  Rs232: Rs232Context
  Tcp: TcpContext
  Udp: UdpContext
  Xudp: XudpContext
}
