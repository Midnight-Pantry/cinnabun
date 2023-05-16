import { Cinnabun } from "../cinnabun.js"
import { Component } from "../component.js"
import { Signal } from "../signal.js"

/**
 * @typedef {Object} ServerBakeResult
 * @property {import('../types').SerializedComponent} componentTree
 * @property {string} html
 */

/**
 * @typedef {Object} Accumulator
 * @property {string[]} html
 * @property {Promise<any>[]} promiseQueue
 */

/**
 * @typedef SSRConfig
 * @property {Cinnabun} cinnabunInstance
 * @property {import("stream").Writable} [stream]
 */

export class SSR {
  /**
   * @param {Component} app
   * @param {SSRConfig} config
   * @returns {Promise<ServerBakeResult>}
   */
  static async serverBake(app, config) {
    console.time("render time")
    const accumulator = {
      html: [],
      promiseQueue: [],
    }

    const serialized = await SSR.serialize(accumulator, app, config)

    console.timeEnd("render time")
    return {
      componentTree: { children: [serialized], props: {} },
      html: accumulator.html.join(""),
    }
  }

  /**
   * @param {string} val
   * @returns {string}
   */
  static serializePropName(val) {
    switch (val) {
      case "className":
        return "class"
      default:
        return val
    }
  }

  /**
   *
   * @param {Component} component
   * @returns {Partial<import('../types').ComponentProps>}
   */
  static serializeProps(component) {
    const res = {}
    const props = component.getProps()
    for (const k of Object.keys(props)) {
      const p = props[k]
      if (Signal.isSignal(p)) {
        res[k] = p.value
      } else {
        if (k === "children") continue
        if (k === "promise" && "prefetch" in props) continue
        res[k] = p
      }
    }
    return res
  }

  /**
   * @param {Accumulator} accumulator
   * @param {Component} component
   * @param {SSRConfig} config
   * @returns {Promise<import("../types").SerializedComponent>}
   */
  static async serialize(accumulator, component, config) {
    component.cbInstance = config.cinnabunInstance
    component.applyBindProps()

    /** @type {import("../types").SerializedComponent} */
    const res = {
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
    } = component.getProps()

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

  /**
   * @param {string} content
   * @param {SSRConfig} config
   * @param {Accumulator} accumulator
   */
  static render(content, config, accumulator) {
    if (config.stream) {
      config.stream.write(content)
    } else {
      accumulator.html.push(content)
    }
  }

  /**
   * @param {Accumulator} accumulator
   * @param {Component} component
   * @param {boolean} shouldRender
   * @param {SSRConfig} config
   * @returns {Promise<import("../types").SerializedComponent[]>}
   */
  static async serializeChildren(accumulator, component, shouldRender, config) {
    const res = []
    for await (const c of component.children) {
      if (typeof c === "string" || typeof c === "number") {
        if (shouldRender) SSR.render(c.toString(), config, accumulator)
        res.push({ children: [], props: {} })
        continue
      }

      if (Signal.isSignal(c)) {
        if (shouldRender) SSR.render(c.value.toString(), config, accumulator)
        res.push({ children: [], props: {} })
        continue
      }
      if (typeof c === "object" && !Component.isComponent(c)) {
        //just a safety thing, so we see '[Object object]' in the frontend
        //instead of crashing from trying to serialize the object as a component

        if (shouldRender) {
          //@ts-ignore
          SSR.render(c.toString(), config, accumulator)
        }
        res.push({ children: [], props: {} })
        continue
      }
      if (typeof c === "function") {
        const props = component.getProps()
        if ("promiseCache" in component && props.prefetch) {
          component.promiseCache = await props.promise()
          component.setProps({ ...props, promiseCache: component.promiseCache })
        }

        const val = c(...component.childArgs)
        if (Component.isComponent(val)) {
          val.parent = component
          const sc = await SSR.serialize(accumulator, val, config)
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

  /**
   *
   * @param {Component} _
   * @returns {import("../types").SerializedComponent}
   */
  static serializeSvg(_) {
    throw new Error("not implemented yet")
  }
}

/**
 * @template T
 * @param {Component} self - The component instance.
 * @param {string} requestDataPath - The path for the request data.
 * @param {T} fallback - The fallback value.
 * @returns {T | undefined} - The requested data or the fallback value.
 */
export function useRequestData(self, requestDataPath, fallback) {
  return Cinnabun.isClient
    ? fallback
    : Cinnabun.getInstanceRef(self).getServerRequestData(requestDataPath)
}
