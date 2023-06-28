import { Cinnabun, Component } from "cinnabun"
import { TransitionProps } from "./types"

type UseTransitionProps = {
  onMounted: (self: Component) => void
  onBeforeUnmounted: (self: Component) => Promise<boolean> | boolean
  initialStyle: string
}
export const useTransition = (props: TransitionProps): UseTransitionProps => {
  const fromStyle = () => {
    return props.properties.map((p) => `${p.name}: ${p.from}`).join(";")
  }
  const toStyle = () => {
    return props.properties.map((p) => `${p.name}: ${p.to}`).join(";")
  }

  const minTransitionTime = Math.max(
    ...props.properties.map((p) => p.ms ?? 300)
  )

  const handleMount = (self: Component) => {
    if (!self.element || !Cinnabun.isClient) return
    self.element.setAttribute("style", `${transitionProps()};${toStyle()}`)
  }
  const handleBeforeUnmount = (self: Component) => {
    if (!self.element || !Cinnabun.isClient) return false
    self.element.setAttribute("style", `${transitionProps()};${fromStyle()}`)

    return new Promise<boolean>((res) => {
      setTimeout(() => {
        return res(true)
      }, minTransitionTime)
    })
  }

  const transitionProps = () => {
    return `transition: ${props.properties
      .map((p) => `${p.name} ${p.ms ?? 300}ms`)
      .join(",")}`
  }
  return {
    onMounted: handleMount,
    onBeforeUnmounted: handleBeforeUnmount,
    initialStyle: `${transitionProps()};${fromStyle()}`,
  }
}
