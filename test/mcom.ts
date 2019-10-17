import { MCom } from '../mcom'
import { taglogger } from '../logger';

const udplogger = taglogger('udp_buf');
const comlogger = taglogger('com_buf');

const test = async () => {
  // const com_buf = await MCom({ protocol: 'Buf', transport: 'Rs232', config: { port: '/dev/ttyUSB0', baudRate: 115200 } });
  const udp_buf = await MCom({ protocol: 'Bm', transport: 'Udp', config: { port: 2222 } });
  const http_buf = await MCom({ protocol: 'Buf', transport: 'Http', config: { port: 2020 } });

  udp_buf.on((data, { ip, port }) => udplogger.log(`${ip}:${port} sent:\n`, JSON.stringify(data, null, '  ')));
  // com_buf.on(data => comlogger.log(data.toString()));
  http_buf.respond((data, ctx) => Buffer.from(`${data.toString()} -> response :)`));
  
  // udp_buf.emit([
  //   { key: '8-bit int', type: 'i8', data: -2 },
  //   { key: 'double array', type: 'double[]', data: [3.1415, 8e5] }
  // ], { ip: 'localhost', port: 2222 });

  const response = await http_buf.request(Buffer.from('REQUEST'));
  console.log('RESPONSE:', response.toString());
}
test();
