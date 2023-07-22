import { PropsWithChildren } from "cinnabun/types"
import { TransitionProperty, TransitionProps } from "./types"
import { useTransition } from "./useTransition"
import { Component } from "cinnabun"

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
  tag = "article",
  settings,
  children,
  properties = [],
  unit = "%",
  cancelExit,
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
  const { onMounted, onBeforeUnmounted, initialStyle } = useTransition({
    properties,
    cancelExit,
  })
  return new Component(tag, {
    children,
    style: initialStyle,
    onMounted,
    onBeforeUnmounted,
    ...rest,
  })
}
