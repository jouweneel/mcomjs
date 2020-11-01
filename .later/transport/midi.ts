import { Input } from 'midi'

import { TransportFn } from './types'
import { emitter, find } from '../util'
import { taglogger } from '../logger'

interface MidiConfig {
  name: string
}

const logger = taglogger('transport-midi');

const list = () => {
  const tmp = new Input();
  const nr = tmp.getPortCount();
  const devices: Record<string,any>[] = [];

  for (let i = 0; i < nr; i++) {
    const name = tmp.getPortName(i);
    devices.push({ name, port: i });
  }

  tmp.closePort();
  return devices;
}

export const Midi: TransportFn<MidiConfig> = async ({
  name
}) => {
  let input: any = null;
  const { emit, on } = emitter();

  const connect = async () => {
    if (input) {
      try {
        input.closePort();
      } catch(e) {
      } finally {
        input = null;
      }
    }
    const device = find(d => d.name === name, list());

    if (!device) {
      throw new Error(`Unknown device "${name}"`);
    }
  
    input = new Input();

    input.on('message', (dt: number, msg: number[]) => {
      emit('data', Buffer.from(msg));
    });

    input.openPort(device.port);
    logger.debug(`${device.name} connected`);
  }

  await connect();

  return {
    connect,
    list: async () => list(),
    on
  };
};
