import { Cinnabun } from "./cinnabun"
import { Component } from "./component"
import { Signal } from "./signal"
import { ComponentProps, GenericComponent, SerializedComponent } from "./types"

export type ServerPromise<T> = Promise<T>

type ServerBakeResult = {
  componentTree: SerializedComponent
  html: string
}

type Accumulator = {
  html: string[]
  promiseQueue: Promise<any>[]
}

export class SSR {
  static async serverBake(
    app: Component<any>,
    cbInstance: Cinnabun
  ): Promise<ServerBakeResult> {
    const accumulator: Accumulator = {
      html: [],
      promiseQueue: [],
    }

    const serialized = await SSR.serialize(accumulator, app, cbInstance)
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
      // const p =
      //   typeof component.props[k] === "undefined" ? true : component.props[k]
      const p = component.props[k]
      if (p instanceof Signal) {
        res[k] = p.value
      } else {
        if (k === "children") continue
        if (k === "promise" && "prefetch" in component.props) continue
        res[k] = p
      }
    }
    return res
  }

  public static async serialize(
    accumulator: Accumulator,
    component: GenericComponent,
    cbInstance: Cinnabun
  ): Promise<SerializedComponent> {
    component.cbInstance = cbInstance
    component.applyBindProps()

    const res: SerializedComponent = {
      props: SSR.serializeProps(component),
      children: [],
    }

    const {
      children,
      onMounted,
      onDestroyed,
      subscription,
      promise,
      prefetch,
      render,
      watch,
      ...rest
    } = component.props

    const shouldRender = component.shouldRender()

    if (shouldRender && subscription) component.subscribeTo(subscription)

    if (!shouldRender || !component.tag) {
      if (shouldRender) {
        const children = await SSR.serializeChildren(
          accumulator,
          component,
          shouldRender,
          cbInstance
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
        .filter(
          ([k]) =>
            k !== "style" && !k.startsWith("bind:") && !k.startsWith("on")
        )
        .map(
          ([k, v]) =>
            ` ${SSR.serializePropName(k)}="${component.getPrimitive(v)}"`
        )
        .join("")}${renderClosingTag ? "" : "/"}>`
    )

    res.children = await SSR.serializeChildren(
      accumulator,
      component,
      shouldRender,
      cbInstance
    )

    if (renderClosingTag) accumulator.html.push(`</${component.tag}>`)
    return res
  }

  public static async serializeChildren(
    accumulator: Accumulator,
    component: GenericComponent,
    shouldRender: boolean,
    cbInstance: Cinnabun
  ): Promise<SerializedComponent[]> {
    const res: SerializedComponent[] = []
    for await (const c of component.children) {
      if (typeof c === "string" || typeof c === "number") {
        if (shouldRender) accumulator.html.push(c.toString())
        res.push({ children: [], props: {} })
        continue
      }

      if (c instanceof Signal) {
        if (shouldRender) accumulator.html.push(c.value)
        res.push({ children: [], props: {} })
        continue
      }
      if (typeof c === "object" && !(c instanceof Component)) {
        //just a safety thing, so we see '[Object object]' in the frontend
        //instead of crashing from trying to serialize the object as a component

        //@ts-ignore
        if (shouldRender) accumulator.html.push(c.toString())
        res.push({ children: [], props: {} })
        continue
      }
      if (typeof c === "function") {
        if ("promiseCache" in component && component.props.prefetch) {
          component.promiseCache = await component.props.promise()
          component.props.promiseCache = component.promiseCache
        }

        const val = c(...component.childArgs)
        if (val instanceof Component) {
          val.parent = component
          const sc = await SSR.serialize(accumulator, val, cbInstance)
          res.push(sc)
        } else if (typeof val === "string" || typeof val === "number") {
          if (shouldRender) accumulator.html.push(val.toString())
          res.push({ children: [], props: {} })
          continue
        }
        continue
      }

      const sc = await SSR.serialize(accumulator, c, cbInstance)
      res.push(sc)
    }
    return res
  }

  public static serializeSvg(_: Component<any>): SerializedComponent {
    throw new Error("not implemented yet")
  }
}

export function useRequestData<T>(
  self: GenericComponent,
  requestDataPath: string,
  fallback: T
) {
  return Cinnabun.isClient
    ? fallback
    : self.cbInstance?.getServerRequestData<T>(requestDataPath)
}