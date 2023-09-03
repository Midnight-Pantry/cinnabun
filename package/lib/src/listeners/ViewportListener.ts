import { Cinnabun } from "../cinnabun"
import { Component } from "../component"

type ViewportListenerEvent = {
  width: number
  height: number
  scrollX: number
  scrollY: number
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
    scrollX: 0,
    scrollY: 0,
    landscape: false,
  }
  let lastState: ViewportListenerEvent = { ...state }
  let interval: number | undefined

  const handleResize = () => {
    state = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      landscape: window.innerWidth > window.innerHeight,
    }
  }

  return new Component("", {
    onMounted() {
      if (!Cinnabun.isClient) return
      window.addEventListener("resize", handleResize)
      document.addEventListener("scroll", handleResize)
      interval = window.setInterval(() => {
        if (
          state.width === lastState.width &&
          state.height === lastState.height &&
          state.landscape === lastState.landscape &&
          state.scrollX === lastState.scrollX &&
          state.scrollY === lastState.scrollY
        )
          return
        lastState = { ...state }
        onCapture(state)
      }, throttleRateMs)
    },
    onUnmounted() {
      if (!Cinnabun.isClient) return
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("scroll", handleResize)
      if (typeof interval !== "undefined") {
        window.clearInterval(interval)
        interval = undefined
      }
    },
  })
}
