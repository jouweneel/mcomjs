import SerialPort from 'serialport'

import { Rs232Context, Rs232Config } from './types'
import { Transport, Sub, TransportFn } from '../types_private'
import { taglogger } from '../../logger'

type Rs232Transport = Transport<Rs232Context>
type Rs232Sub = Sub<Rs232Context>

const logger = taglogger('transport-Rs232');

export const Rs232: TransportFn<Rs232Config, Rs232Transport> = ({
  port, ...options
}) => new Promise((resolve, reject) => {
  let iv = null;
  const subs: Rs232Sub[] = [];

  options.autoOpen = false;
  const serial = new SerialPort(port, options);

  const transmit = (data: Buffer): Promise<number> => new Promise((res, rej) => {
    serial.write(data, (e, size) => e ? rej(e) : res(size));
  });
  
  const emit: Rs232Transport['emit'] = async (data) => {
    try {
      return transmit(data);
    } catch(e) {
      logger.error(e);
    }
  }
  const on: Rs232Transport['on'] = callback => subs.push(callback);

  const transport = {
    emit,
    on,
    stop: () => new Promise(serial.close.bind(serial))
  }

  serial.on('data', (data: Buffer) => {
    for (const sub of subs) {
      sub(data);
    }
  });
  serial.on('open', () => {
    if (iv) {
      clearInterval(iv);
      iv = null;
    }
    logger.log(`Connected to ${port}`);
    resolve(transport)
  });
  serial.on('close', () => {
    iv = setInterval(async () => {
      serial.open(e => {
        e && logger.debug(`Connection attempt to ${port} failed`);
      });
    }, 1000);
  });
  serial.open(err => err && reject(err));
});
