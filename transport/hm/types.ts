export interface HmConfig {
  pubPort: number
  subPort: number
}

export interface HmContext {
  ip: string
  port?: number
  broadcast?: boolean
  id?: number
  flags?: number
}
