import { Writable } from "stream"
import { Cinnabun } from "./cinnabun"
import { Component, FragmentComponent } from "./component"
import { Signal } from "./signal"
import { ComponentProps, SerializedComponent } from "./types"

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
    app: Component,
    config: SSRConfig
  ): Promise<ServerBakeResult> {
    if (process.env.DEBUG) console.time("render time")
    const accumulator: Accumulator = {
      html: [],
      promiseQueue: [],
    }

    const serialized = await SSR.serialize(accumulator, app, config)

    if (process.env.DEBUG) console.timeEnd("render time")
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

  public static serializeProps(component: Component): Partial<ComponentProps> {
    const res: Partial<ComponentProps> = {}

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
    component: Component,
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

    res.tag = component.tag

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
    component: Component,
    shouldRender: boolean,
    config: SSRConfig
  ): Promise<(SerializedComponent | string)[]> {
    const res: (SerializedComponent | string)[] = []
    for await (const c of component.children) {
      if (typeof c === "string" || typeof c === "number") {
        if (shouldRender) SSR.render(c.toString(), config, accumulator)
        res.push(c.toString())
        continue
      }

      if (c instanceof Signal) {
        if (shouldRender) SSR.render(c.value.toString(), config, accumulator)
        res.push(c.value.toString())
        continue
      }
      if (typeof c === "object" && !(c instanceof Component)) {
        //just a safety thing, so we see '[Object object]' in the frontend
        //instead of crashing from trying to serialize the object as a component

        //@ts-ignore
        const stringified = JSON.stringify(c)
        if (shouldRender) SSR.render(stringified, config, accumulator)
        res.push(stringified)
        continue
      }
      if (typeof c === "function") {
        if ("promiseCache" in component && component.props.prefetch) {
          component.promiseCache = await component.props.promise()
          component.props.promiseCache = component.promiseCache
        }

        let val = c(...component.childArgs)
        if (Array.isArray(val)) val = new FragmentComponent(val)
        if (val instanceof Component) {
          val.parent = component
          const sc = await SSR.serialize(accumulator, val, config)
          res.push(sc)
        } else if (typeof val === "string" || typeof val === "number") {
          if (shouldRender) SSR.render(val.toString(), config, accumulator)
          res.push(val.toString())
          continue
        }
        continue
      }

      const sc = await SSR.serialize(accumulator, c, config)
      res.push(sc)
    }
    return res
  }
}

export function useRequestData<T>(
  self: Component,
  requestDataPath: string,
  fallback: T
) {
  return Cinnabun.isClient
    ? fallback
    : self.cbInstance?.getServerRequestData<T>(requestDataPath)
}
