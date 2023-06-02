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
}

export const SlideInOut = ({
  children,
  settings,
  properties,
  ...rest
}: PropsWithChildren & SlideProps) => {
  const ms = settings.duration ?? 300
  const getProperties = (settings: SlideSettings) => {
    const slideProps: TransitionProperty[] = []
    switch (settings.from) {
      case "bottom":
        slideProps.push({
          name: "translate",
          from: "0 100vh",
          to: "0",
          ms,
        })
        break
      case "top":
        slideProps.push({
          name: "translate",
          from: "0 -100vh",
          to: "0",
          ms,
        })
        break
      case "left":
        slideProps.push({
          name: "translate",
          from: "-100vw",
          to: "0",
          ms,
        })
        break
      case "right":
        slideProps.push({
          name: "translate",
          from: "100vw",
          to: "0",
          ms,
        })
        break
    }
    if (properties) slideProps.push(...properties)
    return slideProps
  }
  return (
    <Transition {...rest} {...{ properties: getProperties(settings) }}>
      {children}
    </Transition>
  )
}
