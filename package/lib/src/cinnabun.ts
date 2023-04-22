import { Component, Signal } from "."
import {
  ComponentChild,
  ComponentFunc,
  ComponentProps,
  SSRProps,
  SerializedComponent,
  WatchedElementRef,
} from "./types"
export { h, fragment } from "."

export class Cinnabun {
  static readonly DEBUG_COMPONENT_REFCOUNT = false
  static readonly isClient: boolean = "window" in globalThis
  static path: string = "/"
  static hash: string = ""
  static fragMap: Map<Element | ChildNode, number> = new Map()

  static setPath(newPath: string) {
    Cinnabun.path = newPath
  }
  static setHash(newHash: string) {
    Cinnabun.hash = newHash
  }

  static hydrate(app: Component<any>, ssrProps: SSRProps) {
    console.log("hydrating", ssrProps)
    console.time("hydration time")

    const tray = new Component(ssrProps.root.tagName)
    tray.element = ssrProps.root
    tray.children = [app]
    debugger
    if (app.tag) {
      app.element = ssrProps.root.children[0]
    }

    if (
      ssrProps.component?.props &&
      Object.keys(ssrProps.component.props).length
    )
      Object.assign(app.props, ssrProps.component.props)

    const baseSerializedChild = ssrProps.component.children[0]

    for (let i = 0; i < app.children.length; i++) {
      const c = app.children[i]
      const sc = baseSerializedChild.children[i]
      const domNode = app.tag
        ? ssrProps.root.children[0].children[i]
        : ssrProps.root.children[i]

      Cinnabun.hydrateComponent(app, c, sc, domNode)
    }

    console.timeEnd("hydration time")
    console.log("hydrated", tray)
  }

  static hydrateComponent(
    parent: Component<any>,
    c: ComponentChild,
    sc: SerializedComponent,
    element?: Element | ChildNode | undefined | null
  ) {
    if (typeof c === "string" || typeof c === "number" || c instanceof Signal) {
      return
    }
    if (typeof c === "function")
      return Cinnabun.hydrateComponentFunc(parent, c, sc, element)

    //if (!c.tag) debugger
    //if (c.tag.toLowerCase() === "article") debugger
    if (sc && sc.props && Object.keys(sc.props).length) {
      Object.assign(c.props, sc.props)
    }
    let el: Element | ChildNode | undefined | null
    let childOffset: number = 0
    let didSetCache = false
    if (c.tag) {
      c.element = element
      c.updateElement()
      el = element
    } else {
      el = element?.parentElement
      if (el) {
        const cache = Cinnabun.fragMap.get(el)
        if (cache) childOffset = cache
        Cinnabun.fragMap.set(el, (cache ?? 0) + c.children.length)
        didSetCache = true
      }
    }

    c.bindEvents(c.props)

    for (let i = 0; i < c.children.length; i++) {
      let domNode = el?.childNodes[i + childOffset]
      if (!didSetCache && el) {
        const cache = Cinnabun.fragMap.get(el)
        if (cache) {
          childOffset = cache
          domNode = el?.childNodes[childOffset]
        }
      }
      const child = c.children[i]
      const sChild = sc.children[i]

      if (child instanceof Signal) {
        c.renderChild(child)
      }
      Cinnabun.hydrateComponent(c, child, sChild, domNode)
    }
  }

  static hydrateComponentFunc(
    parent: Component<any>,
    c: ComponentFunc,
    sc: SerializedComponent,
    element?: Element | ChildNode | undefined | null
  ) {
    Cinnabun.hydrateComponent(parent, c(...parent.childArgs), sc, element)
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

  static renderDynamic(
    cmpntOrCmpntFunc: Component<any> | { (): Component<any> }
  ): Node {
    if (typeof cmpntOrCmpntFunc === "function") {
      const val = cmpntOrCmpntFunc()
      if (typeof val === "string" || typeof val === "number") return val
      return Cinnabun.renderDynamic(val)
    }
    return cmpntOrCmpntFunc.render()
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
        typeof c === "string"
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
