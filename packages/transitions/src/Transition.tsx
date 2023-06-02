import * as Cinnabun from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"

export type TransitionProperty = {
  name: string
  from: string | number
  to: string | number
  ms?: number
}

type TransitionProps = { properties: TransitionProperty[] }

export const Transition = ({
  children,
  properties,
  ...rest
}: PropsWithChildren & TransitionProps) => {
  const fromStyle = () => {
    return properties.map((p) => `${p.name}: ${p.from}`).join(";")
  }
  const toStyle = () => {
    return properties.map((p) => `${p.name}: ${p.to}`).join(";")
  }

  const handleMount = (self: Cinnabun.Component) => {
    if (!self.element || !Cinnabun.Cinnabun.isClient) return
    self.element.setAttribute("style", `${transitionProps()};${toStyle()}`)
  }
  const handleBeforeUnmount = (self: Cinnabun.Component) => {
    if (!self.element || !Cinnabun.Cinnabun.isClient) return
    self.element.setAttribute("style", `${transitionProps()};${fromStyle()}`)

    return new Promise<boolean>((res) => {
      setTimeout(() => {
        return res(true)
      }, 300)
    })
  }

  const transitionProps = () => {
    return `transition: ${properties
      .map((p) => `${p.name} ${p.ms ?? 300}ms`)
      .join(",")}`
  }
  return (
    <div
      style={`${transitionProps()};${fromStyle()}`}
      onMounted={handleMount}
      onBeforeUnmounted={handleBeforeUnmount}
      {...rest}
    >
      {children}
    </div>
  )
}
