# McomJS - eMbedded Communication library
McomJS is the Node.JS implementation of my attempt to create one single software library that allows communication between any two devices.

To achieve this goal, Mcom combines two main parts in communication: the `Transport` and `Protocol` layers, wrapped in an API that is as stupidly simple as possible, only needing one simple (database-friendly!) object to configure and instantiate the communication channel.

The setup is simple: a `Transport` is simply a configurable module that either exposes `emit` / `on` functions (PubSub/EventEmitter), `request` / `respond` functions (wip - not sure if this is usable), or both - which take a Buffer and a transport-specific context object (for stuff like target IP, COM port, ...) to put data on some line, or receive from it. Next, a `Protocol` is a module that takes a fixed data format, containing an `encode` and `decode` function to convert between readable javascript Objects and transmittable Buffers.

The fixed non-encoded data format contains the following:
```ts
interface McomMessage {
  data: any         // The data to be converted into a Buffer by the Protocol
  cmd?: number      // Optional, meant to select the action to take on the receiving side
  type?: DataType   // Optional, meant to be used by protocols that need it to build a correct data buffer
```
The reason for this layout is the ability to encode multiple cmd/data pairs into a single buffer, meaning that multiple payloads targeted at different pieces of logic on the receiving end can be encoded into a single message. Protocols that don't need al this fancyness can simply take the `{ data }` property of the `McomMessage` entry and convert that to a Buffer.

The only exported `MCom` function, finally, allows you to create an instance of a `Transport`/`Protocol` pair with the transport configuration, giving you one neat interface to read from or write to your setup of choice.

# TL;DR - show me some code!
```ts
const BufTcp = async () => {
  // TCP server instance
  const srv = await MCom({
    protocol: 'Buf', transport: 'Tcp', config: { mode: 'server', port: 2222 }
  });

  srv.on('connect', ctx => console.log(`${ctx.ip}:${ctx.port} connected`));
  srv.on('data', (msg, { ip, port }) => {
    console.log(`Received`, msg.data.toString(), 'from ${ip}:${port}');
    srv.emit({ data: Buffer.from('response') }, { ip, port });
  });
  srv.on('disconnect', async ctx => {
    if (ctx) {
      // if the server calls back a disconnect WITH context, the context is that of a disconnected socket
      console.log(`${ctx.ip}:${ctx.port} disconnected`);
      await srv.disconnect();
      console.log('server stopped');
    } else {
      // if the server calls back WITHOUT context, the server itself disconnected
      console.log('server disconnected');
    }
  });

  // TCP client instance
  const cli = await MCom({
    protocol: 'Buf', transport: 'Tcp', config: { mode: 'client', port: 2222 }
  });

  cli.on('data', msg => {
    console.log('cli got back', msg.data.toString());
    cli.disconnect();
  });

  cli.emit({ data: Buffer.from('cli1') });
}
```
