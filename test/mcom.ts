import { MCom } from '../mcom'
import { taglogger } from '../logger';

const udplogger = taglogger('udp_buf');
const comlogger = taglogger('com_buf');

const test = async () => {
  // const com_buf = await MCom({ protocol: 'Buf', transport: 'Rs232', config: { port: '/dev/ttyUSB0', baudRate: 115200 } });
  const udp_bm = await MCom({ protocol: 'Bm', transport: 'Udp', config: { port: 2222 } });
  const http_buf = await MCom({ protocol: 'Buf', transport: 'Http', config: { port: 2020 } });

  // com_buf.on(data => comlogger.log(data.toString()));
  udp_bm.on((data, { ip, port }) => udplogger.log(`${ip}:${port} sent:\n`, data));
  http_buf.respond((data, ctx) => Buffer.from(`${data.toString()} -> response :)`));
  
  udp_bm.emit([
    { key: 'str', type: 'string', data: 'hoi' },
    { key: 'str2', type: 'string', data: 'hoi!' },
  ], { ip: 'localhost', port: 2222 });

  const response = await http_buf.request(Buffer.from('REQUEST'));
  console.log('RESPONSE:', response.toString());
}
test();
