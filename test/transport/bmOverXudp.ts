import { readFileSync, writeFileSync } from 'fs'

import { Xudp } from '../../transport'
import { getIp } from '../../transport/util'

import { Bm } from '../../protocol'
import { BM } from '../../protocol/types'

const ip = getIp();
const cfg = { port: 2222 };

const input: BM = {
  cls: 'data',
  key: 'picture',
  data: readFileSync(`${__dirname}/in.jpg`),
  type: 'u8[]'
}

const test = async () => {
  const xudp = await Xudp(cfg);

  xudp.on((ctx, buf) => {
    const [ output ] = Bm.decode(buf);
    if (output.key === 'picture') {
      console.log(`Received ${output.cls}:${output.key}, type ${output.type}[${output.data.length}]`);
      writeFileSync(`${__dirname}/out${ctx.id}.jpg`, output.data);
      xudp.stop();
    }
  });

  await xudp.emit({ ip }, Bm.encode([ input ]));
}
test();
