import { readFileSync, writeFileSync } from 'fs'

import { Hm } from '../../transport'
import { getIp } from '../../transport/util'
import { bm2buf, buf2bm } from '../../protocol'
import { BM } from '../../protocol/types'

const ip = getIp();
const hmCfg = { pubPort: 2222, subPort: 2222 };

const input: BM = {
  key: 'picture',
  data: readFileSync(`${__dirname}/in.jpg`),
  type: 'u8a'
}

const test = async () => {
  const hm = await Hm(hmCfg);
  hm.on((ctx, buf) => {
    const output = buf2bm(buf);
    if (output.key === 'picture') {
      writeFileSync(`${__dirname}/out${ctx.id}.jpg`, output.data);
    }
  });

  await hm.emit({ ip }, bm2buf(input));
}
test();
