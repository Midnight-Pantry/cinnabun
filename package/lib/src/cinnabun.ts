import { Component } from "."
import { ComponentProps, SerializedComponent, WatchedElementRef } from "./types"
export { h, fragment } from "."

export class Cinnabun {
  static readonly DEBUG_COMPONENT_REFCOUNT = false

  static hydrate(rootComponent: SerializedComponent, rootElement: HTMLElement) {
    //console.log("hydrate", rootComponent, rootElement)
    console.time("hydration")
    const tray = new Component(rootElement.tagName)
    tray.element = rootElement

    tray.props = {
      ...rootComponent.p,
      children: rootComponent.c
        ? rootComponent.c.map((c, i) => {
            return Cinnabun.hydrateComponent(c, rootElement.children[i])
          })
        : [],
    }

    console.timeEnd("hydration")
    //console.log("hydrated", tray)
  }

  static hydrateComponent(
    component: SerializedComponent,
    element?: Element
  ): Component<any> {
    const c = new Component<any>(element?.tagName ?? "")
    if (element) c.element = element
    c.props = {
      ...component.p,
      children: component.c
        ? component.c.map((c, i) => {
            return Cinnabun.hydrateComponent(c, element?.children[i])
          })
        : [],
    }
    return c
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
      componentTree: { c: [serialized] },
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
    return {}
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
