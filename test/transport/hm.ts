import { readFileSync, writeFileSync } from 'fs'

import { Hm } from '../../transport'
import { getIp } from '../../transport/util'

const ip = getIp();
const hmCfg = { pubPort: 2222, subPort: 2222 };
const input = readFileSync('in.jpg');

const test = async () => {
  const hm = await Hm(hmCfg);
  hm.on((ctx, data) => {
    writeFileSync(`out${ctx.id}.jpg`, data);
  });

  await hm.emit({ ip }, input);
}
test();
