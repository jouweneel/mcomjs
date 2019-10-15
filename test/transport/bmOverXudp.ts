import { readFileSync, writeFileSync } from 'fs'

import { Xudp } from '../../transport'
import { getIp } from '../../transport/util'

import { bm2buf, buf2bm } from '../../protocol'
import { BM } from '../../protocol/types'

const ip = getIp();
const cfg = { port: 2222 };

// const input: BM = {
//   key: 'picutre',
//   data: readFileSync(`${__dirname}/in.jpg`),
//   type: 'u8a'
// }
console.log(`${__dirname}/out0.jpg`);

const test = async () => {
  const xudp = await Xudp(cfg);

  xudp.on((ctx, buf) => {
    const output = buf2bm(buf);
    if (output.key === 'picture') {
      console.log(`Received ${output.key}, type ${output.type}[${output.data.length}]`);
      writeFileSync(`${__dirname}/out${ctx.id}.jpg`, output.data);
      xudp.stop();
    }
  });

  // await xudp.emit({ ip }, bm2buf(input));
}
test();
