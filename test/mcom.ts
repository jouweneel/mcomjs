import { MCom } from '../mcom'
import { taglogger } from '../logger';

const udplog = taglogger('udp_buf');
const comlog = taglogger('com_buf');

const test = async () => {
  const udp_buf = await MCom({ protocol: 'Buf', transport: 'Udp', config: { port: 2222 } });
  const com_buf = await MCom({ protocol: 'Buf', transport: 'Rs232', config: { port: '/dev/ttyUSB0', baudRate: 115200 } });

  udp_buf.on(udplog.log);
  com_buf.on(data => {
    comlog.log(data.toString());
  });
  
  const input = Buffer.from([1, 2, 3, 4]);
  udp_buf.emit(input, { ip: '192.168.0.138', port: 3333 });
}
test();
