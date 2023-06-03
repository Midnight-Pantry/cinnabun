import * as Cinnabun from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"
import { Transition, TransitionProperty } from "./Transition"

type SlideDirection = "left" | "top" | "right" | "bottom"
type SlideSettings = {
  from: SlideDirection
  duration?: number
}
type SlideProps = {
  settings: SlideSettings
  properties?: TransitionProperty[]
  reverseExit?: boolean
  absoluteExit?: boolean
}

export const SlideInOut = ({
  children,
  settings,
  properties = [],
  ...rest
}: PropsWithChildren & SlideProps) => {
  const ms = settings.duration ?? 300
  switch (settings.from) {
    case "bottom":
      properties.push({
        name: "translate",
        from: "0 100vh",
        to: "0",
        ms,
      })
      break
    case "top":
      properties.push({
        name: "translate",
        from: "0 -100vh",
        to: "0",
        ms,
      })
      break
    case "left":
      properties.push({
        name: "translate",
        from: "-100vw",
        to: "0",
        ms,
      })
      break
    case "right":
      properties.push({
        name: "translate",
        from: "100vw",
        to: "0",
        ms,
      })
      break
  }
  return (
    <Transition {...rest} {...{ properties }}>
      {children}
    </Transition>
  )
}
