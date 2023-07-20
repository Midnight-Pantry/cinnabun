export type TransitionProperty = {
  name: string
  from: string | number
  to: string | number
  ms?: number
}

export type TransitionProps = {
  tag?: string
  properties: TransitionProperty[]
  reverseExit?: boolean
  absoluteExit?: boolean
  cancelExit?: { (): boolean }
}
