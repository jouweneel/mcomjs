import { RequestOptions } from 'http'

export interface HttpConfig {
  host?: string
  port: number
}

export type HttpContext = RequestOptions;
