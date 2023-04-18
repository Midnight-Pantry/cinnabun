import { Component } from "."
import { ComponentProps, WatchedElementRef } from "./types"
export { h, fragment } from "."

export class Cinnabon {
  static readonly DEBUG_COMPONENT_REFCOUNT = false

  static bake(app: Component<any>, root: HTMLElement) {
    const tray = new Component<any>(root.tagName, {
      children: [app],
    })
    tray.element = root
    tray.render()
  }

  static render(component: Component<any> | { (): Component<any> }): Node {
    if (typeof component === "function") {
      const val = component()
      if (typeof val === "string" || typeof val === "number") return val
      return Cinnabon.render(val)
    }
    return component.render()
  }
  static getInputType(val: any): string {
    switch (typeof val) {
      case "boolean":
        return "checkbox"
      case "number":
        return "number"
      case "string":
      case undefined:
        return "text"
    }
    throw new Error(
      "unable to get input type for val with type: " + typeof val + " - " + val
    )
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
          : Cinnabon.svg(typeof c === "function" ? c() : c)
      )
    }

    //@ts-ignore
    return el as SVGElement
  }
}

export let componentReferences: WatchedElementRef[] = []

export const setComponentReferences = (func: {
  (arr: WatchedElementRef[]): WatchedElementRef[]
}) => {
  componentReferences = func(componentReferences)
  if (Cinnabon.DEBUG_COMPONENT_REFCOUNT)
    console.debug(
      "onDestroyCallbacks",
      componentReferences.length,
      performance.now()
    )
}
export const addComponentReference = (ref: WatchedElementRef) => {
  componentReferences.push(ref)
  if (Cinnabon.DEBUG_COMPONENT_REFCOUNT)
    console.debug(
      "onDestroyCallbacks",
      componentReferences.length,
      performance.now()
    )
}
