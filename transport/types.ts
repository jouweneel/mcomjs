import { UdpConfig, UdpContext } from './udp/types'
import { XudpConfig, XudpContext } from './xudp/types'
import { Rs232Context, Rs232Config } from './rs232/types'
import { Transport, TransportFn } from './types_private'


export interface Transports {
  Rs232: TransportFn<Rs232Config, Transport<Rs232Context>>
  Udp: TransportFn<UdpConfig, Transport<UdpContext>>
  Xudp: TransportFn<XudpConfig, Transport<XudpContext>>
}

export interface TransportConfigs {
  Rs232: Rs232Config
  Udp: UdpConfig
  Xudp: XudpConfig
}

export interface TransportContexts {
  Rs232: Rs232Context
  Udp: UdpContext
  Xudp: XudpContext
}
