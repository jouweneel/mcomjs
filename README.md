# McomJS - universal eMbedded Communication library
McomJS is the Node.JS implementation of my attempt to create one single software platform that connects any two devices, and the result of my decade of experimenting with home automation.

To achieve this goal, Mcom combines two main parts in communication: the `Transport` and `Protocol` layers, wrapped in an API that is as stupidly simple as possible, only needing one simple (database-friendly!) object to configure and instantiate the communication channel.

The setup is simple: a `Transport` is simply a configurable module that either exposes `emit` / `on` functions (PubSub/EventEmitter), `request` / `respond` functions (wip - not sure if this is usable), or both - which take a Buffer and a transport-specific context object (for stuff like target IP, COM port, ...) to put data on some line, or receive from it. Next, a `Protocol` is a module that takes a self-defined data format, containing an `encode` function to convert this data format to a Buffer, and a `decode` function to convert a Buffer back to its own format.

The only exported `MCom` function, finally, allows you to create an instance of a `Transport`/`Protocol` pair with the transport configuration, giving you one neat interface to read from or write to your setup of choice - nicely typed so that you'll know what to pass for every instance :).

# TL;DR - show me the code!
```ts
const udp_buf = await MCom({
  protocol: 'Buf',
  transport: 'Udp',
  config: { port: 2222 }
});

const com_buf = await MCom({
  protocol: 'Bm',
  transport: 'Rs232',
  config: { port: '/dev/ttyUSB0', baudRate: 115200 }
});

udp_buf.on((data, { ip, port }) => console.log(data.toString()));
com_buf.on(data => );

udp_buf.emit(Buffer.from([1, 2, 3]), { ip: 'localhost', port: 2222 });
com_buf.emit([
  { key: '8-bit integer', type: 'i8', data: -2 },
  { key: 'double array', type: 'double[]', data: [4.15, 5.16] }
]);
```

Corresponding output (I didn't actually have a COM-port device connected xD - but the `udp_buf` data was encoded to a buffer, sent to localhost, and parsed back to this result with the ByteMap protocol included in this package):

```
2019-10-17 02:36:39:572 [transport-Rs232] Connected to /dev/ttyUSB0
2019-10-17 02:36:39:581 [transport-Udp] Listening on port 2222
2019-10-17 02:36:39:586 [udp_buf] 127.0.0.1:2222 sent:
 [
  {
    "cls": "sys",
    "key": "8-bit int",
    "type": "i8",
    "data": -2
  },
  {
    "cls": "sys",
    "key": "double array",
    "type": "double[]",
    "data": {
      "0": 3.1415,
      "1": 800000
    }
  }
]

```