import { Cinnabun } from "../cinnabun"
import { Component } from "../"

type NavigationListenerProps = {
  onCapture: (ev: PopStateEvent) => void
}
export const NavigationListener = (props: NavigationListenerProps) => {
  return new Component("", {
    onMounted() {
      if (!Cinnabun.isClient) return
      window.addEventListener("popstate", props.onCapture)
    },
    onUnmounted() {
      if (!Cinnabun.isClient) return
      window.removeEventListener("popstate", props.onCapture)
    },
  })
}
