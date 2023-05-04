import { Writable } from "stream"
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

export type SSRConfig = {
  cinnabunInstance: Cinnabun
  useFileBasedRouting?: boolean
  stream?: Writable
}

export class SSR {
  static async serverBake(
    app: Component<any>,
    config: SSRConfig
  ): Promise<ServerBakeResult> {
    console.time("render time")
    const accumulator: Accumulator = {
      html: [],
      promiseQueue: [],
    }

    const serialized = await SSR.serialize(accumulator, app, config)
    // resolve promises, components should replace their corresponding item in the html arr

    console.timeEnd("render time")
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
      if (Signal.isSignal(p)) {
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
    config: SSRConfig
  ): Promise<SerializedComponent> {
    component.cbInstance = config.cinnabunInstance
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
          config
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
      ["br", "hr", "img", "input", "link", "meta"].indexOf(
        component.tag.toLowerCase()
      ) === -1

    const html = `<${component.tag}${Object.entries(rest ?? {})
      .filter(
        ([k]) => k !== "style" && !k.startsWith("bind:") && !k.startsWith("on")
      )
      .map(
        ([k, v]) =>
          ` ${SSR.serializePropName(k)}="${component.getPrimitive(v)}"`
      )
      .join("")}${renderClosingTag ? "" : "/"}>`

    SSR.render(html, config, accumulator)

    res.children = await SSR.serializeChildren(
      accumulator,
      component,
      shouldRender,
      config
    )

    if (renderClosingTag) {
      const cTag = `</${component.tag}>`
      SSR.render(cTag, config, accumulator)
    }
    return res
  }

  static render(content: string, config: SSRConfig, accumulator: Accumulator) {
    if (config.stream) {
      config.stream.write(content)
    } else {
      accumulator.html.push(content)
    }
  }

  public static async serializeChildren(
    accumulator: Accumulator,
    component: GenericComponent,
    shouldRender: boolean,
    config: SSRConfig
  ): Promise<SerializedComponent[]> {
    const res: SerializedComponent[] = []
    for await (const c of component.children) {
      if (typeof c === "string" || typeof c === "number") {
        if (shouldRender) SSR.render(c.toString(), config, accumulator)
        res.push({ children: [], props: {} })
        continue
      }

      if (Signal.isSignal(c)) {
        //@ts-ignore
        const s = c as Signal<any>
        if (shouldRender) SSR.render(s.value.toString(), config, accumulator)
        res.push({ children: [], props: {} })
        continue
      }

      if (typeof c === "object" && !Component.isComponent(c)) {
        //just a safety thing, so we see '[Object object]' in the frontend
        //instead of crashing from trying to serialize the object as a component
        //@ts-ignore
        if (shouldRender) SSR.render(c.toString(), config, accumulator)
        res.push({ children: [], props: {} })
        continue
      }
      if (typeof c === "function") {
        if ("promiseCache" in component && component.props.prefetch) {
          component.promiseCache = await component.props.promise()
          component.props.promiseCache = component.promiseCache
        }

        const val = c(...component.childArgs)
        if (Component.isComponent(val)) {
          const cpnt = val as Component<any>
          cpnt.parent = component
          const sc = await SSR.serialize(accumulator, cpnt, config)
          res.push(sc)
        } else if (typeof val === "string" || typeof val === "number") {
          if (shouldRender) SSR.render(val.toString(), config, accumulator)
          res.push({ children: [], props: {} })
          continue
        }
        continue
      }

      const sc = await SSR.serialize(accumulator, c, config)
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

export const FileRouter = () => {
  return new Component("")
}
