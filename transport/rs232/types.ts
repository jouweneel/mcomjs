import { OpenOptions } from 'serialport'

export type Rs232Config = OpenOptions & {
  port: string
}

export interface Rs232Context {}
