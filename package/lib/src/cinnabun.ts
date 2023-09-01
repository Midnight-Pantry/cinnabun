import { Component } from "."
import { DomInterop } from "./domInterop"
import { ClassConstructor, WatchedElementRef } from "./types"
export { h, fragment } from "."

export type RuntimeService<Class> = InstanceType<ClassConstructor<Class>>

type ServerRequestData = {
  path: string
  data: {
    [key: string]: any
  }
}

export class Cinnabun {
  static readonly DEBUG_COMPONENT_REFCOUNT = false
  static readonly isClient: boolean = "window" in globalThis

  //client singleton
  static rootMap: Map<Element | ChildNode, number> = new Map()
  static componentReferences: WatchedElementRef[] = []
  static runtimeServices: RuntimeService<any>[] = []

  //ssr instance
  private serverComponentReferences: WatchedElementRef[] = []
  private serverRequest: ServerRequestData = {
    path: "/",
    data: {},
  }

  setServerRequestData(data: ServerRequestData) {
    this.serverRequest = data
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

  static bake(app: Component, root: HTMLElement): void {
    const tray = new Component(root.tagName, {
      children: [app],
    })
    tray.element = root
    DomInterop.render(tray)
  }

  static getComponentReferences(component: Component) {
    return Cinnabun.isClient
      ? Cinnabun.componentReferences
      : component.cbInstance!.serverComponentReferences
  }

  static removeComponentReferences(component: Component) {
    Cinnabun.removeComponentChildReferences(component)

    if (Cinnabun.isClient) {
      Cinnabun.componentReferences = Cinnabun.componentReferences.filter(
        (c) => c.component !== component
      )
    } else {
      component.cbInstance!.serverComponentReferences =
        component.cbInstance!.serverComponentReferences.filter(
          (c) => c.component !== component
        )
    }
    if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
      Cinnabun.logComponentRefCount(component)
  }

  static removeComponentChildReferences(component: Component) {
    for (const c of component.children) {
      if (c instanceof Component) Cinnabun.removeComponentReferences(c)
    }
  }

  static addComponentReference = (ref: WatchedElementRef) => {
    if (Cinnabun.isClient) {
      Cinnabun.componentReferences.push(ref)
    } else {
      ref.component.cbInstance!.serverComponentReferences.push(ref)
    }

    if (Cinnabun.DEBUG_COMPONENT_REFCOUNT)
      Cinnabun.logComponentRefCount(ref.component)
  }

  static logComponentRefCount(component: Component) {
    console.debug(
      "~~ CB REF COUNT",
      Cinnabun.isClient
        ? Cinnabun.componentReferences.length
        : component.cbInstance!.serverComponentReferences.length,
      performance.now()
    )
  }

  static registerRuntimeServices<Class>(...services: RuntimeService<Class>[]) {
    Cinnabun.runtimeServices.push(...services)
  }

  static getRuntimeService<Class extends ClassConstructor<any>>(
    classRef: Class
  ): InstanceType<Class> {
    return Cinnabun.runtimeServices.find((s) => {
      return s instanceof classRef
    })
  }
}
