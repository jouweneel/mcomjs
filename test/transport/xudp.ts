import { readFileSync, writeFileSync } from 'fs'

import { Xudp } from '../../transport'
import { getIp } from '../../transport/util'

const ip = getIp();
const cfg = { port: 2222 };
const input = readFileSync('in.jpg');

const test = async () => {
  const xudp = await Xudp(cfg);
  xudp.on((ctx, data) => {
    writeFileSync(`out${ctx.id}.jpg`, data);
  });

  await xudp.emit({ ip }, input);
}
test();
