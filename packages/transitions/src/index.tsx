import * as Cinnabun from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"

type TransitionProperty = {
  name: string
  from: string
  to: string
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

export const FadeInOut = ({
  children,
  properties,
  ...rest
}: PropsWithChildren & { properties?: TransitionProperty[] }) => {
  return (
    <Transition
      properties={[
        { name: "opacity", from: "0", to: "1" },
        ...(properties ?? []),
      ]}
      {...rest}
    >
      {children}
    </Transition>
  )
}

type SlideDirection = "left" | "top" | "right" | "bottom"
type SlideSettings = {
  from: SlideDirection
  duration?: number
}
type SlideProps = {
  settings: SlideSettings
  properties?: TransitionProperty[]
}

export const SlideInOut = ({
  children,
  settings,
  properties,
  ...rest
}: PropsWithChildren & SlideProps) => {
  const ms = settings.duration ?? 300
  const getProperties = (settings: SlideSettings) => {
    const slideProps: TransitionProperty[] = []
    switch (settings.from) {
      case "bottom":
        slideProps.push({
          name: "translate",
          from: "0 100vh",
          to: "0",
          ms,
        })
        break
      case "top":
        slideProps.push({
          name: "translate",
          from: "0 -100vh",
          to: "0",
          ms,
        })
        break
      case "left":
        slideProps.push({
          name: "translate",
          from: "-100vw",
          to: "0",
          ms,
        })
        break
      case "right":
        slideProps.push({
          name: "translate",
          from: "100vw",
          to: "0",
          ms,
        })
        break
    }
    if (properties) slideProps.push(...properties)
    return slideProps
  }
  return (
    <Transition {...rest} {...{ properties: getProperties(settings) }}>
      {children}
    </Transition>
  )
}
