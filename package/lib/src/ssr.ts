import { Cinnabun } from "./cinnabun"
import { Component } from "./component"
import { Signal } from "./signal"
import { ComponentProps, GenericComponent, SerializedComponent } from "./types"

type ServerBakeResult = {
  componentTree: SerializedComponent
  html: string
}

type Accumulator = {
  html: string[]
  promiseQueue: Promise<any>[]
}

export class SSR {
  static async serverBake(app: Component<any>): Promise<ServerBakeResult> {
    const accumulator: Accumulator = {
      html: [],
      promiseQueue: [],
    }
    const serialized = await SSR.serialize(accumulator, app)
    // resolve promises, components should replace their corresponding item in the html arr
    return {
      componentTree: { children: [serialized], props: {} },
      html: accumulator.html.join(""),
    }
  }

  public static serializePropName(val: string): string {
    switch (val) {
      case "className":
        return "class"
      default:
        return val
    }
  }

  public static serializeProps<T extends HTMLElement>(
    component: GenericComponent
  ): Partial<ComponentProps<T>> {
    const res: Partial<ComponentProps<T>> = {}
    for (const k of Object.keys(component.props)) {
      const p = component.props[k]
      if (p instanceof Signal) {
        res[k] = p.value
      } else {
        if (k === "children") continue
        if (k === "promise" && "prefetch" in component.props) continue
        res[k] = component.props[k]
      }
    }
    return res
  }

  public static async serialize(
    accumulator: Accumulator,
    component: GenericComponent
  ): Promise<SerializedComponent> {
    const res: SerializedComponent = {
      props: SSR.serializeProps(component),
      children: [],
    }

    const {
      children,
      onMounted,
      onChange,
      onClick,
      onDestroyed,
      subscription,
      promise,
      prefetch,
      render,
      ...rest
    } = component.props

    const shouldRender = component.shouldRender()

    if (shouldRender && subscription) component.subscribeTo(subscription)

    if (!shouldRender || !component.tag) {
      if (shouldRender) {
        const children = await SSR.serializeChildren(
          accumulator,
          component,
          shouldRender
        )
        return {
          props: SSR.serializeProps(component),
          children,
        }
      }
      return res
    }

    if (component.tag === "svg") return SSR.serializeSvg(component)

    const renderClosingTag =
      ["br", "hr", "img", "input"].indexOf(component.tag.toLowerCase()) === -1

    accumulator.html.push(
      `<${component.tag}${Object.entries(rest ?? {})
        .filter(([k]) => k !== "style" && !k.startsWith("bind:"))
        .map(
          ([k, v]) =>
            ` ${SSR.serializePropName(k)}="${component.getPrimitive(v)}"`
        )
        .join("")}${renderClosingTag ? "" : "/"}>`
    )

    res.children = await SSR.serializeChildren(
      accumulator,
      component,
      shouldRender
    )

    if (renderClosingTag) accumulator.html.push(`</${component.tag}>`)
    return res
  }

  public static async serializeChildren(
    accumulator: Accumulator,
    component: GenericComponent,
    shouldRender: boolean
  ): Promise<SerializedComponent[]> {
    const res: SerializedComponent[] = []
    for await (const c of component.children) {
      if (typeof c === "string" || typeof c === "number") {
        if (shouldRender) accumulator.html.push(c)
        res.push({ children: [], props: {} })
        continue
      }
      if (c instanceof Signal) {
        if (shouldRender) accumulator.html.push(c.value)
        res.push({ children: [], props: {} })
        continue
      }
      if (typeof c === "function") {
        if ("promiseCache" in component && component.props.prefetch) {
          component.promiseCache = await component.props.promise()
          component.props.promiseCache = component.promiseCache
        }
        const val = c(...component.childArgs)
        val.parent = component
        const sc = await SSR.serialize(accumulator, val)
        res.push(sc)
        continue
      }

      const sc = await SSR.serialize(accumulator, c)
      res.push(sc)
    }
    return res
  }

  public static serializeSvg(_: Component<any>): SerializedComponent {
    throw new Error("not implemented yet")
  }

  static setRequestPath(newPath: string) {
    Cinnabun.serverRequestPath = newPath
  }
}
