import { MCom } from '../mcom'
import { BM } from '../protocol/bm/types'
import { taglogger } from '../logger';

const logger = taglogger('udp');

const test = async () => {
  const udp = await MCom({ protocol: 'Bm', transport: 'Udp', config: { port: 2121 } });
  const reply: BM[] = [{ key: 'reply', type: 'string', data: 'pong!' }];

  udp.on((data, { ip, port }) => {
    logger.log(`${ip}:${port} sent`, data);
    setTimeout(() => udp.emit(reply, { ip, port }), 10);
  });
}
test();
