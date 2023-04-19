import { Component } from "."
import { ComponentProps, SerializedComponent, WatchedElementRef } from "./types"
export { h, fragment } from "."

export class Cinnabun {
  static readonly DEBUG_COMPONENT_REFCOUNT = false

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
    const componentTree = app.serialize(htmlData)
    return {
      componentTree,
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
