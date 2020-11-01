import { MCom } from '../index'

const BsUdp = async () => {
  const srv = await MCom({
    protocol: 'Bs', transport: 'Udp', config: { mode: 'server', port: 2222 }
  });

  const cli = await MCom({
    protocol: 'Bs', transport: 'Udp', config: { mode: 'server', port: 3333 }
  });

  srv.on('data', (msg, ctx) => {
    console.log(`Received`, msg, 'from', ctx);
    srv.emit({ cmd: 3, data: 'response', type: 'string' }, ctx);
  });

  cli.on('data', msg => console.log('got back', msg));
}

const BufTcp = async () => {
  const srv = await MCom({
    protocol: 'Buf', transport: 'Tcp', config: { mode: 'server', port: 2222 }
  });

  srv.on('connect', ctx => console.log(`${ctx.ip}:${ctx.port} connected`));
  srv.on('data', (msgs, ctx) => {
    console.log(`Received`, msgs[0].data.toString(), 'from', ctx);
    srv.emit({ data: Buffer.from('response') }, ctx);
  });

  const cli = await MCom({
    protocol: 'Buf', transport: 'Tcp', config: { mode: 'client', port: 2222 }
  });

  srv.on('disconnect', async ctx => {
    if (ctx) {
      console.log(`${ctx.ip}:${ctx.port} disconnected`);
      await srv.disconnect();
    } else {
      console.log('server disconnected');
    }
  });

  cli.on('data', msgs => {
    console.log('cli got back', msgs[0].data.toString());
    cli.disconnect();
  });
  cli.emit({ data: Buffer.from('cli1') });
}

const test = async () => {
  // await BsUdp();
  await BufTcp();

  /** UDP emit */
  // udp.emit([
  //   { cmd: 0, type: 'string', data: 'Testinguuuu' },
  //   { cmd: 2, type: 'u8', data: 250 },
  //   { cmd: 1, type: 'i16[]', data: [2, -4000] },
  //   { cmd: 3, type: 'hsv[]', data: [[0, 200, 255], [34, 100, 250]] },
  //   { cmd: 4, type: 'json', data: { a: [1, 2], b: 'dingen!' } }
  // ], { ip: 'localhost', port: 2222 });

  /** Buffer over RS232 */
  // const com = await MCom({
  //   protocol: 'Buf', transport: 'Rs232', config: {
  //     port: '/dev/ttyUSB0', baudRate: 115200
  //   }
  // });
    // On incoming data
  // com.on(data => console.log(data.toString()));

  /** Buffer over HTTP (Request/Response) */
  // const http = await MCom({ protocol: 'Buf', transport: 'Http', config: { port: 2020 } });
  // http.respond((data, ctx) => Buffer.from(`${data[0].data} -> response :)`));
  // const response = await http.request({ data: 'DINGEN!' });

  // console.log(`Response:`, response.toString());
  
}
test();
