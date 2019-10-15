# Xudp - Xtended UDP
Xudp is a wrapper around the Node.JS native `dgram` library and extends the capabilities of UDP sockets.

There are 3 main extra features compared to regular UDP sockets:
- Data can be split into multiple packets of a user-definable size (which is mainly meant for transmitting to embedded devices with a limited buffer size)
- Data can be sent/received in a Request/Response kind of fashion (that is, normal UDP extends an EventEmitter, meaning that when data is received, it is impossible to determine if the data belonged to a certain `emit`) - TO BE IMPLEMENTED
- Transmission control can be enabled (i.e., if desired, packets will be retransmitted if they are not acknowledged by the receiving end in a certain time frame) - TO BE IMPLEMENTED

---
## Types and API
---
Configuration parameters when creating a `Xudp` transport:
```ts
interface XudpConfig {
  port: number
}
```

`Xudp`-specific context, providing non-`Transport`-generic data for sending/receiving:
```ts
interface XudpContext {
  ip: string
  port?: number
  broadcast?: boolean
  id?: number
  flags?: number
}
```

Generic `XTransport` type (from `transport/types.ts`, annotated with `Xudp` specifics):
```ts
interface XTransport<XudpContext> {
  emit: (ctx: XudpContext, data: Buffer) => Promise<number>
  on: (callback: (ctx: XudpContext, data: Buffer) => void) => void
  request: (ctx: XudpContext, data: Buffer) => Promise<Buffer>
  respond: (callback: (ctx: XudpContext, data: Buffer) => void) => void
  stop: () => Promise<any>
}
```

Exported API functions:
```ts
Xudp(config: XudpConfig) => Promise<XTransport<XudpContext>>
```
