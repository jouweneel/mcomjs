import { MCom } from '../index'

const test = async () => {
  /** ByteMap over UDP */
  const udp = await MCom({
    protocol: 'Bs', transport: 'Udp', config: { port: 2222 }
  });
    // On incoming data
  udp.on((data, { ip, port }) => {
    console.log(`${ip}:${port} sent`, ...data);
    data[0].data = "pong!";

    setTimeout(() => {
      udp.emit(data, { ip, port });
    }, 1000);
  });

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
  const http = await MCom({ protocol: 'Buf', transport: 'Http', config: { port: 2020 } });
  http.respond((data, ctx) => Buffer.from(`${data[0].data} -> response :)`));
  const response = await http.request({ data: 'DINGEN!' });

  console.log(`Response:`, response.toString());
  
}
test();
