import { Component } from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"
import { TransitionProps } from "./types"
import { useTransition } from "./useTransition"

export const Transition = ({
  tag = "div",
  children,
  properties,
  cancelExit,
  ...rest
}: PropsWithChildren & TransitionProps) => {
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
