import { Cinnabun } from "./cinnabun.js"
import { Component, FragmentComponent, SuspenseComponent } from "./component.js"
import { CONSTANTS } from "./constants.js"
import { DomInterop } from "./domInterop.js"
import { Signal } from "./signal.js"
import {
  SSRProps,
  ComponentChild,
  SerializedComponent,
  LazyComponentModule,
  ComponentProps,
} from "./types.js"

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
      if (Component.isComponent(c)) Hydration.validate(c)
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

    Hydration.validate(tray)
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

    if (typeof c === "string" || typeof c === "number" || Signal.isSignal(c)) {
      Hydration.updateParentOffset(parentElement, 1)
      return
    }
    if (typeof c === "function") {
      const usePromiseCache =
        "promiseCache" in parent.props &&
        (parent.props.prefetch || parent.props["prefetch:defer"])

      let val = usePromiseCache
        ? c(...[false, parent.props.promiseCache])
        : c(...parent.childArgs)

      if (Array.isArray(val)) val = new FragmentComponent(val)
      if (Component.isComponent(val)) {
        if (!val.shouldRender()) return
        DomInterop.removeFuncComponents(parent)
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
        if (Signal.isSignal(curProp)) continue
        c.props[k] = v
      }
    }
    if (sc?.children && sc.children.length > 0 && c.children.length === 0) {
      const serializedChildrenWithKeys = sc.children.filter(
        (c) => typeof c === "object" && typeof c.props.key !== "undefined"
      )
      for (let i = 0; i < serializedChildrenWithKeys.length; i++) {
        const sChild = serializedChildrenWithKeys[i] as SerializedComponent
        if (
          !c.children.find(
            (child) =>
              child instanceof Component && child.props.key === sChild.props.key
          )
        ) {
          const newChild = Hydration.createKeyNodeChild(
            sChild,
            parentElement as HTMLElement
          )
          if (!newChild) continue
          if (Component.isComponent(newChild)) newChild.parent = c
          c.children.push(newChild)
        }
      }
    }

    if (!c.shouldRender()) return

    if (c.tag && !c.element) {
      const offset = Hydration.getParentOffset(parentElement)
      let node = parentElement.childNodes[offset]
      try {
        if (!node) {
          DomInterop.reRender(c)
          return
        }
        if (
          node.nodeType === Node.COMMENT_NODE &&
          node.nodeValue?.includes(CONSTANTS.ssr_deferredLoaderPrefix)
        ) {
          const comment = node
          node = node.nextSibling!
          comment.parentNode?.removeChild(comment)
          Hydration.handleDeferral(parent, node)
        }
      } catch (error) {
        console.error(error, node)
        debugger
      }
      c.element = node as HTMLElement
      Hydration.updateParentOffset(parentElement, 1)
      DomInterop.updateElement(c)
    }

    if (c.props.subscription) c.subscribeTo(c.props.subscription)
    if (
      c.props.promise &&
      "setPromise" in c &&
      typeof c.setPromise === "function" &&
      !c.props.prefetch &&
      !c.props["prefetch:defer"]
    )
      c.setPromise(c.props.promise)

    for (let i = 0; i < c.children.length; i++) {
      const child = c.children[i]
      const sChild = sc?.children ? sc.children[i] : ({} as SerializedComponent)

      if (Signal.isSignal(child)) {
        DomInterop.renderChild(c, child, i)
      }
      const parentEl = c.element ?? parentElement
      if (typeof sChild === "string" || typeof sChild === "number") {
        Hydration.updateParentOffset(parentEl, 1)
        continue
      }
      if (
        Component.isComponent(child) &&
        "renderHtmlAtOwnPeril" in child.props
      ) {
        Hydration.updateParentOffset(parentEl, 1)
        child.mounted = true
        continue
      }

      Hydration.hydrateComponent(c, child, sChild, parentEl)
    }
    c.mounted = true
    c.props.hydrating = false
  }

  static handleDeferral(parent: Component, node: ChildNode) {
    const handleDeferredContentArrival = (evt: Event) => {
      const { deferralId, data } = (evt as CustomEvent).detail as {
        deferralId: string
        data: any
      }
      if (deferralId === parent.props["cb-deferralId"]) {
        const evtScript = document.getElementById(
          `${CONSTANTS.ssr_deferralScriptIdPrefix}${deferralId}`
        )
        if (evtScript) {
          const parentEl = node.parentElement!
          evtScript.parentNode?.removeChild(evtScript)
          Hydration.updateParentOffset(parentEl, -1)
          parentEl.removeChild(node)

          if ("promiseCache" in parent) {
            parent.promiseCache = data
            if ("promiseLoading" in parent) parent.promiseLoading = false
          }
          DomInterop.reRender(parent)
        }
      }
      window.removeEventListener(
        CONSTANTS.ssr_deferralEvtName,
        handleDeferredContentArrival
      )
    }
    window.addEventListener(
      CONSTANTS.ssr_deferralEvtName,
      handleDeferredContentArrival
    )
  }

  static updateParentOffset(parentElement: Element | ChildNode, n: number) {
    Cinnabun.rootMap.set(
      parentElement,
      Hydration.getParentOffset(parentElement) + n
    )
  }

  static getParentOffset(parentElement: Element | ChildNode): number {
    return Cinnabun.rootMap.get(parentElement) ?? 0
  }

  static createComponentChild(
    sc: SerializedComponent | string | number,
    parentElement: HTMLElement
  ): Component | string | number | undefined {
    if (typeof sc === "string" || typeof sc === "number") {
      return sc
    }

    const newComponent = new Component(sc.tag ?? "", { ...sc.props })
    let element: HTMLElement | undefined
    if (newComponent.tag) {
      const offset = Hydration.getParentOffset(parentElement) ?? 0
      element = parentElement.childNodes[offset] as HTMLElement
    }
    if (element) {
      newComponent.element = element
      Hydration.updateParentOffset(parentElement, 1)
    }
    for (const c of sc.children) {
      const child = Hydration.createComponentChild(c, element ?? parentElement)
      if (child) newComponent.children.push(child)
    }
    return newComponent
  }
  static createKeyNodeChild(
    sc: SerializedComponent,
    parentElement: HTMLElement
  ): ComponentChild | undefined {
    if (typeof sc === "string" || typeof sc === "number") {
      return sc
    }
    const newComponent = new Component(sc.tag ?? "", { ...sc.props })
    if (newComponent.tag) {
      const element = Array.from(parentElement.childNodes).find(
        (cn) =>
          cn instanceof HTMLElement &&
          cn.tagName.toLowerCase() === sc.tag?.toLowerCase() &&
          cn.getAttribute("key")?.toString() === sc.props.key.toString()
      )
      if (element) {
        newComponent.element = element as HTMLElement
      } else {
        console.error("failed to acquire element for", sc)
        return undefined
      }
    }

    return newComponent
  }
}
