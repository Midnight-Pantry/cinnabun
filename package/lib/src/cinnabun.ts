import { Component, Signal } from "."
import {
  ComponentChild,
  ComponentProps,
  SSRProps,
  SerializedComponent,
  WatchedElementRef,
} from "./types"
export { h, fragment } from "."

export class Cinnabun {
  static readonly DEBUG_COMPONENT_REFCOUNT = false
  static readonly isClient: boolean = "window" in globalThis
  static serverRequestPath = "/"
  static fragMap: Map<Element | ChildNode, number> = new Map()

  static setServerRequestPath(newPath: string) {
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
      if (c instanceof Component) Cinnabun.validateHydration(c)
    }
  }
  static hydrate(app: Component<any>, ssrProps: SSRProps) {
    console.log("hydrating", ssrProps)
    console.time("hydration time")

    const tray = new Component(ssrProps.root.tagName)
    tray.element = ssrProps.root
    tray.children = [app]

    Cinnabun.hydrateComponent(
      tray,
      app,
      ssrProps.component.children[0],
      ssrProps.root
    )

    console.timeEnd("hydration time")
    console.log("hydrated", tray)
    Cinnabun.validateHydration(tray)
  }

  static hydrateComponent(
    parent: Component<any>,
    c: ComponentChild,
    sc: SerializedComponent,
    parentElement: Element | ChildNode
  ) {
    if (!sc) return
    const childOffset: number = Cinnabun.fragMap.get(parentElement) ?? 0

    if (typeof c === "string" || typeof c === "number" || c instanceof Signal) {
      Cinnabun.fragMap.set(parentElement, childOffset + 1)
      return
    }
    if (typeof c === "function") {
      const val = c(...parent.childArgs)
      if (!val.shouldRender()) return
      Cinnabun.hydrateComponent(parent, val, sc, parentElement)
      parent.funcElements.push(val.element)
      return
    }

    c.parent = parent

    if (sc.props && Object.keys(sc.props).length) {
      Object.assign(c.props, sc.props)
    }

    if (!c.shouldRender()) return

    if (c.tag) {
      c.element = parentElement.childNodes[childOffset]
      Cinnabun.fragMap.set(parentElement, childOffset + 1)
      c.updateElement()
    }

    if (c.props.subscription) c.subscribeTo(c.props.subscription)
    if (c.props.promise) c.setPromise(c.props.promise)
    c.bindEvents(c.props)

    c.mounted = true

    for (let i = 0; i < c.children.length; i++) {
      const child = c.children[i]
      const sChild = sc.children[i]

      if (child instanceof Signal) {
        c.renderChild(child)
      }
      Cinnabun.hydrateComponent(c, child, sChild, c.element ?? parentElement)
    }
  }

  static bake(app: Component<any>, root: HTMLElement): void {
    const tray = new Component<any>(root.tagName, {
      children: [app],
    })
    tray.element = root
    tray.render()
  }

  static serverBake(app: Component<any>): {
    componentTree: SerializedComponent
    html: string
  } {
    let htmlData = { html: "" }
    const serialized = app.serialize(htmlData)
    return {
      componentTree: { children: [serialized], props: {} },
      html: htmlData.html,
    }
  }

  static element<T extends HTMLElement>(
    tag: string,
    props: ComponentProps<T> = {}
  ): Component<T> {
    return new Component<T>(tag, props)
  }

  static svg(component: Component<any>): SVGSVGElement {
    const el = document.createElementNS(
      "http://www.w3.org/2000/svg",
      component.tag
    )

    const { render, ...props } = component.props

    for (const [k, v] of Object.entries(props)) {
      el.setAttribute(k, v)
    }

    for (const c of component.children) {
      el.append(
        typeof c === "string" || typeof c === "number"
          ? c
          : Cinnabun.svg(typeof c === "function" ? c() : c)
      )
    }

    //@ts-ignore
    return el as SVGElement
  }
  static svgToString(_: Component<any>): string {
    return "not implemented"
  }
  static serializeSvg(_: Component<any>): SerializedComponent {
    return { children: [], props: {} }
  }
}

export let componentReferences: WatchedElementRef[] = []

export const setComponentReferences = (func: {
  (arr: WatchedElementRef[]): WatchedElementRef[]
}) => {
  componentReferences = func(componentReferences)
  if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
    console.debug(
      "onDestroyCallbacks",
      componentReferences.length,
      performance.now()
    )
}
export const addComponentReference = (ref: WatchedElementRef) => {
  componentReferences.push(ref)
  if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
    console.debug(
      "onDestroyCallbacks",
      componentReferences.length,
      performance.now()
    )
}
