import { PropsWithChildren } from "cinnabun/types"
import { Transition } from "./Transition"
import { TransitionProperty, TransitionProps } from "./types"

type SlideDirection = "left" | "top" | "right" | "bottom"
type SlideSettings = {
  from: SlideDirection
  duration?: number
}
type SlideProps = Partial<TransitionProps> & {
  settings: SlideSettings
  properties?: TransitionProperty[]
  reverseExit?: boolean
  absoluteExit?: boolean
  unit?:
    | "%"
    | "px"
    | "em"
    | "rem"
    | "vw"
    | "vh"
    | "vmin"
    | "vmax"
    | "ex"
    | "ch"
    | "cm"
    | "mm"
    | "in"
    | "pt"
    | "pc"
}

export const SlideInOut = ({
  settings,
  properties = [],
  unit = "%",
  ...rest
}: PropsWithChildren & SlideProps) => {
  properties.push({
    name: "translate",
    from:
      settings.from === "bottom"
        ? `0 100${unit}`
        : settings.from === "top"
        ? `0 -100${unit}`
        : settings.from === "left"
        ? `-100${unit}`
        : `100${unit}`,
    to: "0",
    ms: settings.duration ?? 300,
  })
  return Transition({ ...rest, properties })
}
