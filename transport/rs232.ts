import SerialPort, { OpenOptions } from 'serialport'

import { Transport, TransportFn } from './types'
import { taglogger } from '../logger'
import { emitter } from '../util';

export type Rs232Config = OpenOptions & {
  port: string
}

const logger = taglogger('transport-rs232');

export const rs232: TransportFn<Rs232Config> = async ({
  port, ...options
}) => {
  options.autoOpen = false;
  const serial = new SerialPort(port, options);
  const { emit, on } = emitter();

  const rs232Emit: Transport['emit'] = data => new Promise((resolve, reject) => {
    serial.write(data, (e, size) => e ? reject(e) : resolve(size));
  });

  const connect: Transport['connect'] = () => new Promise((resolve, reject) => {
    serial.on('error', reject);
    serial.open(e => e ? reject(e) : resolve());
  });

  serial.on('data', (data: Buffer) => emit('data', data));

  await connect();
  logger.debug(`${port} connected`);
  
  return {
    connect,
    emit: rs232Emit,
    on
  }
};
