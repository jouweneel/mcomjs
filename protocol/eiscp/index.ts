import { EISCPMessage } from './types'
import { Protocol } from '../types'

type EISCPProtocol = Protocol<EISCPMessage>

const num2str = (nr: number) => nr.toString(16).toUpperCase().padStart(2, "0");

const decode: EISCPProtocol['decode'] = buf => {
  const length = buf[11];
  const cmd = buf.slice(18, 21).toString();
  const str = buf.slice(21, 13 + length).toString();
  
  if (str.length === 2) {
    try {
      const val = parseInt(str, 16);
      if (!isNaN(val)) {
        return { cmd, data: val };
      }
    } catch(e) {}
  }
  return { cmd, data: Buffer.from(str) };
}

const encode: EISCPProtocol['encode'] = ({ cmd, data }) => {
  const val = (typeof data === 'number') ? num2str(data) : data && data.length ? data.toString() : '';
  const len = cmd.length + val.length + 3;
  const buf = Buffer.alloc(len + 16);

  buf.write("ISCP", 0, 4, "ascii");
	buf[7] = 0x10;
	buf.writeInt32BE(len, 8);
	buf[12] = 0x01;
	buf[16] = 0x21;
	buf[17] = 0x31;
	buf.write(cmd, 18, cmd.length, "ascii");
	buf.write(val, 18 + cmd.length, val.length, "ascii");

	buf[18 + val.length + cmd.length] = 0x0d;
	return buf;
}

export const EISCP: EISCPProtocol = { decode, encode };
