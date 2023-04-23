import { Cinnabun } from "./cinnabun"
import { Component } from "./component"
import { DomInterop } from "./domInterop"
import { Signal } from "./signal"
import {
  ComponentChild,
  ComponentProps,
  GenericComponent,
  SSRProps,
  SerializedComponent,
} from "./types"

export class SSR {
  static serverBake(app: Component<any>): {
    componentTree: SerializedComponent
    html: string
  } {
    let htmlData = { html: "" }
    const serialized = SSR.serialize(htmlData, app)
    return {
      componentTree: { children: [serialized], props: {} },
      html: htmlData.html,
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
        if (k !== "children") res[k] = component.props[k]
      }
    }
    return res
  }

  public static serialize(
    data: { html: string },
    component: GenericComponent
  ): SerializedComponent {
    const {
      children,
      onMounted,
      onChange,
      onClick,
      onDestroyed,
      subscription,
      promise,
      render,
      ...rest
    } = component.props
    const shouldRender = component.shouldRender()
    if (shouldRender && subscription) component.subscribeTo(subscription)
    if (!shouldRender || !component.tag) {
      return {
        props: SSR.serializeProps(component),
        children: shouldRender
          ? SSR.serializeChildren(data, component, shouldRender)
          : [],
      }
    }

    if (component.tag === "svg") return SSR.serializeSvg(component)

    const res: SerializedComponent = {
      props: SSR.serializeProps(component),
      children: [],
    }

    data.html += `<${component.tag}${Object.entries(rest)
      .filter(([k]) => k !== "style" && !k.startsWith("bind:"))
      .map(
        ([k, v]) =>
          ` ${SSR.serializePropName(k)}="${component.getPrimitive(v)}"`
      )
      .join("")}>`

    for (let i = 0; i < component.children.length; i++) {
      const c = component.children[i]
      if (typeof c === "string" || typeof c === "number") {
        if (shouldRender) data.html += c
        res.children.push({ props: {}, children: [] })
        continue
      }
      if (c instanceof Signal) {
        if (shouldRender) data.html += c.value
        continue
      }
      if (typeof c === "function") {
        const val = c(...component.childArgs)
        val.parent = component
        res.children!.push(SSR.serialize(data, val))
        continue
      }

      res.children!.push(SSR.serialize(data, c))
    }

    if (
      ["br", "hr", "img", "input"].indexOf(component.tag.toLowerCase()) === -1
    )
      data.html += `</${component.tag}>`
    return res
  }

  public static serializeChildren(
    data: { html: string },
    component: GenericComponent,
    shouldRender: boolean
  ): SerializedComponent[] {
    return component.children.map((c: ComponentChild) => {
      if (typeof c === "string" || typeof c === "number") {
        if (shouldRender) data.html += c
        return { children: [], props: {} }
      }
      if (typeof c === "function") {
        const val = c(...component.childArgs)
        val.parent = component
        return SSR.serialize(data, val)
      }
      return SSR.serialize(data, c)
    })
  }

  public static serializeSvg(_: Component<any>): SerializedComponent {
    throw new Error("not implemented yet")
  }

  static setRequestPath(newPath: string) {
    Cinnabun.serverRequestPath = newPath
  }

  static async validateHydration(component: Component<any>) {
    if (component.tag && component.shouldRender()) {
      const hasElement = component.element
      const elementMatchesTag =
        hasElement &&
        component.element.tagName.toLowerCase() === component.tag.toLowerCase()

      if (!elementMatchesTag)
        console.error("component hydration failed", component)
    }
    for (const c of component.children) {
      if (c instanceof Component) SSR.validateHydration(c)
    }
  }
  static hydrate(app: Component<any>, ssrProps: SSRProps) {
    console.log("hydrating", ssrProps)
    console.time("hydration time")

    const tray = new Component(ssrProps.root.tagName)
    tray.element = ssrProps.root
    tray.children = [app]

    SSR.hydrateComponent(
      tray,
      app,
      ssrProps.component.children[0],
      ssrProps.root
    )

    console.timeEnd("hydration time")
    console.log("hydrated", tray)
    SSR.validateHydration(tray)
  }

  static hydrateComponent(
    parent: Component<any>,
    c: ComponentChild,
    sc: SerializedComponent,
    parentElement: Element | ChildNode
  ) {
    if (!sc) return
    const childOffset: number = Cinnabun.rootMap.get(parentElement) ?? 0

    if (typeof c === "string" || typeof c === "number" || c instanceof Signal) {
      Cinnabun.rootMap.set(parentElement, childOffset + 1)
      return
    }
    if (typeof c === "function") {
      const val = c(...parent.childArgs)
      if (!val.shouldRender()) return
      SSR.hydrateComponent(parent, val, sc, parentElement)
      parent.funcElements.push(val.element)
      return
    }

    c.parent = parent

    if (sc.props && Object.keys(sc.props).length) {
      for (const [k, v] of Object.entries(sc.props)) {
        const curProp = c.props[k]
        if (curProp && curProp instanceof Signal) {
          curProp.value = v
        } else {
          c.props[k] = v
        }
      }

      //Object.assign(c.props, sc.props)
    }

    if (!c.shouldRender()) return

    if (c.tag) {
      c.element = parentElement.childNodes[childOffset]
      Cinnabun.rootMap.set(parentElement, childOffset + 1)
      DomInterop.updateElement(c)
    }

    if (c.props.subscription) c.subscribeTo(c.props.subscription)
    if (
      c.props.promise &&
      "setPromise" in c &&
      typeof c.setPromise === "function"
    )
      c.setPromise(c.props.promise)

    c.bindEvents(c.props)

    c.mounted = true

    for (let i = 0; i < c.children.length; i++) {
      const child = c.children[i]
      const sChild = sc.children[i]

      if (child instanceof Signal) {
        DomInterop.renderChild(c, child)
      }
      SSR.hydrateComponent(c, child, sChild, c.element ?? parentElement)
    }
  }
}
