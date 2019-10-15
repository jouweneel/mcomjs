import { pluck } from 'ramda'

export interface XudpMessage {
  data: Buffer
  id?: number
  flags?: number
}

interface Packet {
  id: number
  index: number
  total: number

  data: Buffer
  flags: number
}

const BUF_SIZE = 1500;
const HEADER_SIZE = 4;
const DATA_SIZE = BUF_SIZE - HEADER_SIZE;

let sysId = 0;
const cache: Packet[][] = [];

export const build = ({
  flags, data, id
}: XudpMessage) => {
  const packetId = (id === 255) ? sysId : id;
  if (id !== 255 && sysId === 254) {
    sysId = 0;
  } else {
    sysId++;
  }

  if (!data) {
    return [Buffer.from([ flags, packetId, 0, 1 ])];
  } else if (data.length < DATA_SIZE) {
    return [Buffer.concat(
      [ Buffer.from([ flags, packetId, 0, 1 ]), data ]
    )];
  }
  const total = Math.ceil(data.length / (BUF_SIZE - HEADER_SIZE)) || 1;
  const bufs: Buffer[] = [];

  for (let i = 0; i < total; i++) {
    const header = Buffer.from([ flags, packetId, i, total]);
    const startIdx = i * DATA_SIZE;
    const buf = Buffer.concat([header, data.slice(startIdx, startIdx + DATA_SIZE)]);
    bufs.push(buf);
  }
  return bufs;
}

export const collect = (data: Buffer): XudpMessage => {
  const flags = data.readUInt8(0);
  const id = data.readUInt8(1);
  const index = data.readUInt8(2);
  const total = data.readUInt8(3);

  const packet: Packet = { flags, id, index, total, data: data.slice(HEADER_SIZE) };

  if (index === 0) {
    cache[id] = [packet];
  } else if (cache[id]) {
    cache[id][index] = packet;
  }

  if ((index === total - 1) && cache[id]) {
    for (let i = 0; i < total; i++) {
      if (!cache[id][i] || !cache[id][i].data) {
        delete cache[id];
        throw new Error(`Incomplete packet[${id}] ${i}/${total}`);
      }
    }
    const bufs = pluck('data', cache[id]);
    return {
      data: Buffer.concat(bufs),
      flags,
      id
    };
  }

  return null;
}
