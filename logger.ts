import colors from 'colors'
import { openSync, writeSync } from 'fs'
import moment from 'moment'
import { join } from 'path'

const file = process.env.LOGFILE && openSync(join(process.cwd(), process.env.LOGFILE), 'w');
const dbg = process.env.NODE_ENV === 'development';

const prefix = (tag: string) => `${moment().format('YYYY-MM-DD HH:mm:ss:SSS')} [${tag}]`;

const filelog = (prefix: string, args: any[]) => {
  file && writeSync(file, `${prefix} `);
  args.map(arg => file && writeSync(file, typeof arg === 'string' ? `${arg} ` : JSON.stringify(arg, null, '  ')));
  file && writeSync(file, '\n');
}

const debug = (tag: string) => (...args: any[]) => {
  dbg && console.log(colors.magenta(prefix(tag)), ...args);
  filelog(`${prefix(tag)} (debug)`, args);
}

const error = (tag: string) => (err: Error, fatal?: boolean) => {
  console.log(colors.red(prefix(tag)), err.message, '\n', colors.red(err.stack));
  filelog(`${prefix(tag)} (error)`, [err.message, err.stack.split('\n')[1].trim()]);
  fatal && process.exit(0);
}

const log = (tag: string) => (...args: any[]) => {
  console.log(colors.green(prefix(tag)), ...args);
  filelog(`${prefix(tag)} (log)`, args);
}

export const taglogger = (tag: string) => ({
  debug: debug(tag),
  error: error(tag),
  log: log(tag)
})
