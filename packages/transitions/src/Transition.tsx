import * as Cinnabun from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"

export type TransitionProperty = {
  name: string
  from: string | number
  to: string | number
  ms?: number
}

type TransitionProps = {
  properties: TransitionProperty[]
  reverseExit?: boolean
  absoluteExit?: boolean
}

export const Transition = ({
  children,
  properties,
  ...rest
}: PropsWithChildren & TransitionProps) => {
  const fromStyle = (reverse: boolean = false) => {
    return properties
      .map((p) => `${p.name}: ${reverse ? `calc(-1 * ${p.from})` : p.from}`)
      .join(";")
  }
  const toStyle = () => {
    return properties.map((p) => `${p.name}: ${p.to}`).join(";")
  }

  const handleMount = (self: Cinnabun.Component) => {
    if (!self.element || !Cinnabun.Cinnabun.isClient) return
    self.element.setAttribute("style", `${transitionProps()};${toStyle()}`)
  }
  const handleBeforeUnmount = (self: Cinnabun.Component) => {
    if (!self.element || !Cinnabun.Cinnabun.isClient) return false
    const el = self.element
    let exitStyle = ""
    if (rest.absoluteExit) {
      const currentPos = self.element.getBoundingClientRect()
      const absolutePosStyle = `position:absolute;top:${currentPos.top}px;left:${currentPos.left}px;right:${currentPos.right}px;bottom:${currentPos.bottom}px;width:${currentPos.width}px;height:${currentPos.height}px;`
      exitStyle += absolutePosStyle
    }

    el.setAttribute(
      "style",
      `${exitStyle}${transitionProps()};${fromStyle(rest.reverseExit)}`
    )

    // get the longest transition time
    const longestTransition = properties.reduce((acc, curr) => {
      if (curr.ms && curr.ms > acc) return curr.ms
      return acc
    }, 300)

    return new Promise<boolean>((res) => {
      setTimeout(() => {
        return res(true)
      }, longestTransition)
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
