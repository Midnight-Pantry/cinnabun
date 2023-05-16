import { Cinnabun } from "./cinnabun.js"
import { Component } from "./component.js"
import { DomInterop } from "./domInterop.js"
import { Signal } from "./signal.js"

export class Hydration {
  /** @param {Component} component */
  static validate(component) {
    if (component.tag && component.shouldRender()) {
      if (
        component.element?.tagName.toLowerCase() !== component.tag.toLowerCase()
      )
        console.error("component hydration failed", component)
    }
    for (const c of component.children) {
      if (Component.isComponent(c)) Hydration.validate(c)
    }
  }

  /**
   *
   * @param {Component} app
   * @param {import("./types.js").SSRProps} ssrProps
   */
  static hydrate(app, ssrProps) {
    console.log("hydrating", ssrProps)
    console.time("hydration time")

    const tray = new Component(ssrProps.root.tagName)
    tray.element = ssrProps.root
    tray.children = [app]

    Hydration.hydrateComponent(
      tray,
      app,
      ssrProps.component.children[0],
      ssrProps.root
    )

    console.timeEnd("hydration time")
    console.log("hydrated", tray)

    // hydration validation breaks with streaming,
    // something to do with the way the browser parses the viewport meta tag 😢

    //Hydration.validate(tray)
  }

  /**
   *
   * @param {Component} parent
   * @param {import("./types.js").ComponentChild} c
   * @param {import("./types.js").SerializedComponent} sc
   * @param {Element | ChildNode} parentElement
   * @returns
   */
  static hydrateComponent(parent, c, sc, parentElement) {
    if (!sc) return
    const childOffset = Cinnabun.rootMap.get(parentElement) ?? 0

    if (typeof c === "string" || typeof c === "number" || Signal.isSignal(c)) {
      Cinnabun.rootMap.set(parentElement, childOffset + 1)
      return
    }
    if (typeof c === "function") {
      const props = parent.getProps()
      const usePromiseCache = "promiseCache" in props && props.prefetch

      const val = usePromiseCache
        ? c(...[false, props.promiseCache])
        : c(...parent.childArgs)

      if (Component.isComponent(val)) {
        if (!val.shouldRender()) return
        Hydration.hydrateComponent(parent, val, sc, parentElement)
        parent.funcComponents.push(val)
      }

      return
    }
    //if (c.tag.toLowerCase() === "input") debugger

    c.parent = parent

    const props = c.getProps()

    if (sc.props && Object.keys(sc.props).length) {
      for (const [k, v] of Object.entries(sc.props)) {
        const curProp = props[k]
        if (Signal.isSignal(curProp)) continue
        props[k] = v
      }
    }
    c.setPropsQuietly(props)

    if (!c.shouldRender()) return

    if (c.tag) {
      //@ts-expect-error ts(2740)
      c.element = parentElement.childNodes[childOffset]
      Cinnabun.rootMap.set(parentElement, childOffset + 1)
      DomInterop.updateElement(c)
    }

    if (props.subscription) c.subscribeTo(props.subscription)
    if (
      props.promise &&
      "setPromise" in c &&
      typeof c.setPromise === "function" &&
      !props.prefetch
    )
      c.setPromise(props.promise)

    c.bindEvents(props)

    c.mounted = true

    for (let i = 0; i < c.children.length; i++) {
      const child = c.children[i]
      const sChild = sc.children[i]

      if (Signal.isSignal(child)) {
        DomInterop.renderChild(c, child)
      }
      Hydration.hydrateComponent(c, child, sChild, c.element ?? parentElement)
    }
  }
}
