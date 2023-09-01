import { Cinnabun } from "../cinnabun"
import { Component } from "../component"

type ViewportListenerEvent = {
  width: number
  height: number
  landscape: boolean
}

type ViewportListenerProps = {
  onCapture: (e: ViewportListenerEvent) => void
  throttleRateMs?: number
}

export const ViewportListener = ({
  onCapture,
  throttleRateMs = 1000 / 60,
}: ViewportListenerProps) => {
  let state: ViewportListenerEvent = {
    width: 0,
    height: 0,
    landscape: false,
  }
  let lastState: ViewportListenerEvent = { ...state }
  let interval: number | undefined

  const handleResize = () => {
    state = {
      width: window.innerWidth,
      height: window.innerHeight,
      landscape: window.innerWidth > window.innerHeight,
    }
  }

  return new Component("", {
    onMounted() {
      if (!Cinnabun.isClient) return
      window.addEventListener("resize", handleResize)
      interval = window.setInterval(() => {
        if (
          state.width === lastState.width &&
          state.height === lastState.height &&
          state.landscape === lastState.landscape
        )
          return
        lastState = { ...state }
        onCapture(state)
      }, throttleRateMs)
    },
    onUnmounted() {
      if (!Cinnabun.isClient) return
      window.removeEventListener("resize", handleResize)
      if (typeof interval !== "undefined") {
        window.clearInterval(interval)
        interval = undefined
      }
    },
  })
}
