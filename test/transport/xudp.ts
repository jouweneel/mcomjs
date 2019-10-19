import { readFileSync, writeFileSync } from 'fs'

import { Xudp } from '../../transport'
import { getIp } from '../../transport/util'

const ip = getIp();
const cfg = { port: 2222 };
const input = readFileSync('in.jpg');

const test = async () => {
  const xudp = await Xudp(cfg);
  xudp.on((data, ctx) => {
    writeFileSync(`out${ctx.id}.jpg`, data);
  });

  await xudp.emit(input, { ip });
}
test();
