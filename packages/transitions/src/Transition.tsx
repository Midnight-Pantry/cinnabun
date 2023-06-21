import { Component } from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"
import { TransitionProps } from "./types"
import { useTransition } from "./useTransition"

export const Transition = ({
  tag = "div",
  children,
  properties,
  ...rest
}: PropsWithChildren & TransitionProps) => {
  const { onMounted, onBeforeUnmounted, initialStyle } = useTransition({
    properties,
  })
  return new Component(tag, {
    children,
    initialStyle,
    onMounted,
    onBeforeUnmounted,
    ...rest,
  })
}
