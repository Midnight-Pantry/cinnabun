import { Writable } from "stream"
import { Cinnabun } from "./cinnabun"
import { Component, FragmentComponent } from "./component"
import { Signal } from "./signal"
import { ComponentProps, SerializedComponent } from "./types"
import { generateUUID, validHtmlProps } from "./utils"

export type ServerPromise<T> = Promise<T>

type ServerBakeResult = {
  componentTree: SerializedComponent
  html: string
}

type PromiseQueueItem = {
  promise: Promise<any>
  callback: { (data: any): Promise<void> }
}
type Accumulator = {
  promiseQueue: PromiseQueueItem[]
  html: string
}

export type SSRConfig = {
  cinnabunInstance: Cinnabun
  stream: Writable | null
}

export class SSR {
  static deferredLoaderPrefix = "cb-deferred-loader"
  static deferralEvtName = "deferral-complete"
  static deferralScriptIdPrefix = "deferral-"

  static async serverBake(
    app: Component,
    config: SSRConfig
  ): Promise<ServerBakeResult> {
    let startTime = 0
    if (process.env.DEBUG) startTime = performance.now()
    const accumulator: Accumulator = {
      promiseQueue: [],
      html: "",
    }

    const serialized = await SSR.serialize(accumulator, app, config)
    if (process.env.DEBUG) {
      console.log(
        `render time: ${Number(performance.now() - startTime).toFixed(3)}ms`
      )
    }

    SSR.render(
      `<script id="server-props">window.__cbData={root:document.documentElement,component:${JSON.stringify(
        { children: [serialized], props: {} }
      )}}</script><script src="/static/index.js" type="module"></script>`,
      config,
      accumulator
    )

    if (accumulator.promiseQueue.length) {
      await Promise.allSettled(
        accumulator.promiseQueue.map(async (item) => {
          const data = await item.promise
          return item.callback(data)
        })
      )
    }

    return {
      componentTree: { children: [serialized], props: {} },
      html: accumulator.html,
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
    return validHtmlProps(component.props)
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
      onBeforeUnmounted,
      onBeforeServerRendered,
      subscription,
      promise,
      prefetch,
      visible,
      watch,
      ...rest
    } = component.props

    const shouldRender = component.shouldRender()

    if (shouldRender && subscription) component.subscribeTo(subscription)
    if (shouldRender && onBeforeServerRendered) {
      await onBeforeServerRendered(component)
    }

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
      .filter(([k, v]) => {
        if (k === "style" && typeof v !== "string") return false
        return !k.startsWith("bind:") && !k.startsWith("on")
      })
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
      SSR.render(`</${component.tag}>`, config, accumulator)
    }
    return res
  }

  static render(content: string, config: SSRConfig, accumulator: Accumulator) {
    if (!config.stream) {
      accumulator.html += content
      return
    }
    config.stream.write(content)
  }

  public static async serializeChildren(
    accumulator: Accumulator,
    component: Component,
    shouldRender: boolean,
    config: SSRConfig
  ): Promise<(SerializedComponent | string)[]> {
    const res: (SerializedComponent | string)[] = []
    // suspense prefetching
    if (shouldRender) {
      const promise = component.props.promise as { (): Promise<any> }
      if (component.props.prefetch && "promiseCache" in component) {
        component.promiseCache = await promise()
        component.props.promiseCache = component.promiseCache
      } else if (
        component.props["prefetch:defer"] &&
        "promiseCache" in component
      ) {
        if (!component.promiseCache) {
          component.props["cb-deferralId"] = generateUUID()
          SSR.render(
            `<!--${SSR.deferredLoaderPrefix}:${component.props["cb-deferralId"]}-->`,
            config,
            accumulator
          )
          accumulator.promiseQueue.push({
            promise: promise(),
            callback: async (data) => {
              component.promiseCache = data
              //await SSR.serialize(accumulator, component, config)
              const deferralId = component.props["cb-deferralId"]
              SSR.render(
                `<script type="module" id="${
                  SSR.deferralScriptIdPrefix
                }${deferralId}">document.dispatchEvent(new CustomEvent("${
                  SSR.deferralEvtName
                }",{
            bubbles:true,
            detail: {
              deferralId: "${deferralId}",
              data: ${JSON.stringify(data)}
            }
          }))
          </script>`,
                config,
                accumulator
              )
            },
          })
        }
      }
    }

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
        try {
          let val = c(...component.childArgs)
          if (Array.isArray(val)) val = new FragmentComponent(val)
          if (val instanceof Component) {
            val.parent = component
            const sc = await SSR.serialize(accumulator, val, config)
            res.push(sc)
            continue
          } else if (typeof val === "string" || typeof val === "number") {
            if (shouldRender) SSR.render(val.toString(), config, accumulator)
            res.push(val.toString())
            continue
          }
        } catch (error) {
          console.error(error)
        }

        continue
      }

      const sc = await SSR.serialize(accumulator, c, config)
      res.push(sc)
    }
    return res
  }
}
