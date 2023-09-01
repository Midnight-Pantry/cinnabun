import { Cinnabun } from "../cinnabun"
import { Component } from "../component"
import { useRef } from "../ref"
import { PropsWithChildren } from "../types"

type ClickOutsideListenerProps = PropsWithChildren & {
  tag: string
  onCapture: (e: MouseEvent) => void
}

export const ClickOutsideListener = ({
  tag,
  onCapture,
  ...rest
}: ClickOutsideListenerProps) => {
  const ref = useRef()

  const handleClick = (e: MouseEvent) => {
    const tgt = e.target as HTMLElement
    if (!ref.value) return
    if (ref.value === tgt) return
    if (ref.value.contains(tgt)) return
    onCapture(e)
  }
  return new Component(tag, {
    ...rest,
    ref,
    onMounted() {
      if (!Cinnabun.isClient) return
      document.addEventListener("click", handleClick)
    },
    onUnmounted() {
      if (!Cinnabun.isClient) return
      document.removeEventListener("click", handleClick)
    },
  })
}
