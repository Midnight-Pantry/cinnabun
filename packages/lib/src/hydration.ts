import { Cinnabun } from "./cinnabun"
import { Component, FragmentComponent } from "./component"
import { DomInterop } from "./domInterop"
import { Signal } from "./signal"
import { SuspenseComponent } from "./suspense"
import {
  SSRProps,
  ComponentChild,
  SerializedComponent,
  LazyComponentModule,
  ComponentProps,
} from "./types"

export class Hydration {
  static validate(component: Component) {
    if (component.tag && component.shouldRender()) {
      const hasElement = component.element
      const elementMatchesTag =
        hasElement &&
        component.element?.tagName.toLowerCase() === component.tag.toLowerCase()

      if (!elementMatchesTag)
        console.error("component hydration failed", component)
    }
    for (const c of component.children) {
      if (c instanceof Component) Hydration.validate(c)
    }
  }
  static hydrate(app: Component, ssrProps: SSRProps) {
    console.log("hydrating", ssrProps)
    console.time("hydration time")

    const tray = new Component(ssrProps.root.tagName)
    tray.element = ssrProps.root
    tray.children = [app]

    Hydration.hydrateComponent(
      tray,
      app,
      ssrProps.component.children[0] as SerializedComponent,
      ssrProps.root
    )

    console.timeEnd("hydration time")
    console.log("hydrated", tray)

    // hydration validation breaks with streaming,
    // something to do with the way the browser parses the viewport meta tag 😢

    //Hydration.validate(tray)
  }

  static async lazyHydrate(
    suspenseWrapper: SuspenseComponent,
    modulePromise: LazyComponentModule,
    props?: Partial<ComponentProps>
  ) {
    const module = await modulePromise
    const component = module.default(props)
    component.parent = suspenseWrapper
    const { element } = DomInterop.getMountLocation(component)
    if (!element) return

    suspenseWrapper.funcComponents.push(component)
    Hydration.hydrateComponent(
      suspenseWrapper,
      component,
      {} as SerializedComponent,
      element
    )
    DomInterop.reRender(component)
  }

  static hydrateComponent(
    parent: Component,
    c: ComponentChild,
    sc: SerializedComponent,
    parentElement: Element | ChildNode
  ) {
    if (!c) return
    const childOffset: number = Cinnabun.rootMap.get(parentElement) ?? 0

    if (typeof c === "string" || typeof c === "number" || c instanceof Signal) {
      Cinnabun.rootMap.set(parentElement, childOffset + 1)
      return
    }
    if (typeof c === "function") {
      const usePromiseCache =
        "promiseCache" in parent.props && parent.props.prefetch

      let val = usePromiseCache
        ? c(...[false, parent.props.promiseCache])
        : c(...parent.childArgs)

      if (Array.isArray(val)) val = new FragmentComponent(val)
      if (val instanceof Component) {
        if (!val.shouldRender()) return
        Hydration.hydrateComponent(parent, val, sc, parentElement)
        parent.funcComponents.push(val)
      }

      return
    }

    //if (c.tag.toLowerCase() === "article") debugger

    c.props.hydrating = true
    c.parent = parent

    if (sc?.props && Object.keys(sc.props).length) {
      for (const [k, v] of Object.entries(sc.props)) {
        const curProp = c.props[k]
        if (curProp instanceof Signal) continue
        c.props[k] = v
      }
    }
    if (sc?.children && sc.children.length > 0 && c.children.length === 0) {
      const serializedChildrenWithKeys = sc.children.filter(
        (c) => typeof c === "object" && c.props.key
      )
      for (let i = 0; i < serializedChildrenWithKeys.length; i++) {
        const sChild = serializedChildrenWithKeys[i] as SerializedComponent
        if (
          !c.children.find(
            (child) =>
              child instanceof Component && child.props.key === sChild.props.key
          )
        ) {
          const newChild = Hydration.createTreeFromServerState(
            sChild,
            parentElement as HTMLElement
          ) as Component
          newChild.parent = c
          c.children.push(newChild)
        }
      }
    }

    if (!c.shouldRender()) return

    if (c.tag) {
      c.element = parentElement.childNodes[childOffset] as HTMLElement
      Cinnabun.rootMap.set(parentElement, childOffset + 1)
      DomInterop.updateElement(c)
    }

    if (c.props.subscription) c.subscribeTo(c.props.subscription)
    if (
      c.props.promise &&
      "setPromise" in c &&
      typeof c.setPromise === "function" &&
      !c.props.prefetch
    )
      c.setPromise(c.props.promise)

    c.bindEvents(c.props)

    for (let i = 0; i < c.children.length; i++) {
      const child = c.children[i]
      const sChild = sc.children ? sc.children[i] : ({} as SerializedComponent)

      if (child instanceof Signal) {
        DomInterop.renderChild(c, child, i)
      }
      if (typeof sChild === "string" || typeof sChild === "number") continue

      Hydration.hydrateComponent(c, child, sChild, c.element ?? parentElement)
    }
    c.mounted = true
    c.props.hydrating = false
  }

  static createTreeFromServerState(
    sc: SerializedComponent | string | number,
    parentElement: HTMLElement
  ): string | number | Component {
    if (typeof sc === "string" || typeof sc === "number") {
      return sc
    }
    const element = Array.from(parentElement.childNodes).find(
      (cn) =>
        cn instanceof HTMLElement &&
        cn.tagName.toLowerCase() === sc.tag?.toLowerCase() &&
        (sc.props.key ? cn.getAttribute("key") === sc.props.key : true)
    )
    const newComponent = new Component(sc.tag ?? "", { ...sc.props })
    newComponent.element = element as HTMLElement
    newComponent.children = sc.children.map((c) => {
      const child = Hydration.createTreeFromServerState(
        c,
        element as HTMLElement
      )
      if (typeof child === "string" || typeof child === "number") return child
      child.parent = newComponent
      return child
    })
    return newComponent
  }
}
