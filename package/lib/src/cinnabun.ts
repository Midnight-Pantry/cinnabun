import { Component } from "."
import { DomInterop } from "./domInterop"
import { WatchedElementRef } from "./types"
export { h, fragment } from "."

type ServerRequestData = {
  path: string
  data: {
    [key: string]: any
  }
}

export class Cinnabun {
  static readonly DEBUG_COMPONENT_REFCOUNT = false
  static readonly isClient: boolean = "window" in globalThis
  static rootMap: Map<Element | ChildNode, number> = new Map()
  static componentReferences: WatchedElementRef[] = []

  serverRequest: ServerRequestData = {
    path: "/",
    data: {},
  }

  getServerRequestData<T>(keysPath: string): T | undefined {
    const props = keysPath.split(".")
    let value: any = { ...this.serverRequest }
    for (let i = 0; i < props.length; i++) {
      value = value[props[i]] as T | undefined
      if (value === undefined) {
        return undefined
      }
    }
    return value as T | undefined
  }

  static bake(app: Component<any>, root: HTMLElement): void {
    const tray = new Component<any>(root.tagName, {
      children: [app],
    })
    tray.element = root
    DomInterop.render(tray)
  }

  static setComponentReferences = (func: {
    (arr: WatchedElementRef[]): WatchedElementRef[]
  }) => {
    Cinnabun.componentReferences = func(Cinnabun.componentReferences)
    if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
      console.debug(
        "onDestroyCallbacks",
        Cinnabun.componentReferences.length,
        performance.now()
      )
  }

  static addComponentReference = (ref: WatchedElementRef) => {
    Cinnabun.componentReferences.push(ref)
    if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
      console.debug(
        "onDestroyCallbacks",
        Cinnabun.componentReferences.length,
        performance.now()
      )
  }
}
