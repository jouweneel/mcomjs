import { MCom } from '../mcom'

const test = async () => {
  /** ByteMap over UDP */
  const udp = await MCom({
    protocol: 'Bm', transport: 'Udp', config: { port: 2222 }
  });
    // On incoming data
  udp.on((data, { ip, port }) => {
    console.log(`${ip}:${port} sent`, data);
    udp.emit(data, { ip: 'localhost', port: 3333 });
  });
    // Send some data
  udp.emit([
    { key: 'str', type: 'string', data: 'Testinguuuu' },
    { key: 'str2', type: 'string', data: '@ITs' },
  ], { ip: 'localhost', port: 2222 });

  /** Buffer over RS232 */
  const com = await MCom({
    protocol: 'Buf', transport: 'Rs232', config: {
      port: '/dev/ttyUSB0', baudRate: 115200
    }
  });
    // On incoming data
  com.on(data => console.log(data.toString()));

  /** Buffer over HTTP (Request/Response) */
  const http = await MCom({ protocol: 'Buf', transport: 'Http', config: { port: 2020 } });
    // Send response on incoming request
  http.respond((data, ctx) => Buffer.from(`${data.toString()} -> response :)`));
    // Make request and wait for response
  const response = await http.request(Buffer.from('REQUEST'));
  console.log(`Response: ${response.toString()}`);
  
}
test();
