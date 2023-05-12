import { Component, Signal } from "."
import { Cinnabun } from "./cinnabun"
import { ComponentChild, GenericComponent } from "./types"

export class DomInterop {
  static updateElement(component: GenericComponent) {
    if (!component.element) return
    const {
      htmlFor,
      children,
      onMounted,
      onDestroyed,
      subscription,
      render,
      style,
      promise,
      ...rest
    } = component.props

    if (style) Object.assign(component.element.style, style)
    if (htmlFor && "htmlFor" in component.element)
      component.element.htmlFor = htmlFor

    if (Object.keys(rest).length) {
      for (const [k, v] of Object.entries(rest)) {
        if (k.includes("bind:")) continue
        if (k.startsWith("on")) {
          Object.assign(component.element, { [k]: v })
          continue
        }
        Object.assign(component.element, {
          [k]: component.getPrimitive(v, () =>
            DomInterop.updateElement(component)
          ),
        })
      }
    }
  }

  static getRenderedChildren(component: GenericComponent) {
    return DomInterop.getRenderableChildren(component).map((c) =>
      DomInterop.renderChild(component, c)
    )
  }

  static getRenderableChildren(component: GenericComponent) {
    return component.children.filter(
      (c) =>
        typeof c === "function" ||
        typeof c === "string" ||
        typeof c === "number" ||
        (Component.isComponent(c) && c.props.render) ||
        Signal.isSignal(c)
    )
  }

  static renderChildren(component: GenericComponent) {
    if (!component.props.render) return
    if (!component.element) return
    DomInterop.removeFuncComponents(component)

    component.element.replaceChildren(
      ...DomInterop.getRenderedChildren(component)
    )
  }

  static renderChild(
    component: GenericComponent,
    child: ComponentChild
  ): string | Node {
    if (Signal.isSignal(child)) {
      component.subscribeTo((_, __) =>
        child.subscribe(() => DomInterop.renderChildren(component))
      )
      return child.value.toString()
    }
    if (Component.isComponent(child)) return DomInterop.render(child)
    if (typeof child === "function") {
      const c = child(...component.childArgs)
      const res = DomInterop.renderChild(component, c)
      if (Component.isComponent(c)) component.funcComponents.push(c)
      return res
    }
    return child.toString()
  }

  static removeFuncComponents(component: GenericComponent) {
    if (component.funcComponents.length > 0) {
      for (const fc of component.funcComponents) {
        DomInterop.unRender(fc)
        Cinnabun.removeComponentReferences(fc)
      }
      component.funcComponents = []
    }
  }

  static unRender(component: GenericComponent) {
    try {
      DomInterop.removeFuncComponents(component)
      if (component.element) {
        //Array.from(component.element.children).forEach((c) => c.remove())
        return component.element.remove()
      }
      for (const c of component.children) {
        if (Component.isComponent(c)) {
          DomInterop.unRender(c)
        } else if (c instanceof Node) {
          c.parentNode?.removeChild(c)
        }
      }
    } catch (error) {
      console.error("failed to unrender", component, error)
      debugger
    }
  }

  static reRender(component: GenericComponent) {
    if (!component.shouldRender()) return
    const el = component.element ?? DomInterop.render(component, true)
    if (component.element) DomInterop.renderChildren(component)
    if (el.isConnected) return

    const { element, idx } = DomInterop.getMountLocation(component)
    if (!element) {
      console.error("Failed to get component mount element", component, el)
      return
    }
    //element.children[idx] is our actual previous child but be need to insert before the next.
    const prevChild = element.children[idx - 1]

    if (prevChild) {
      element.insertBefore(el, prevChild)
    } else {
      element.appendChild(el)
    }
  }

  static render<T extends HTMLElement>(
    component: Component<T>,
    isRerender: boolean = false
  ): T | Node {
    const { children, onMounted, onDestroyed, subscription, promise } =
      component.props

    Cinnabun.removeComponentReferences(component)

    if (!component.tag) {
      const f = document.createDocumentFragment()
      if (subscription) component.subscribeTo(subscription)
      f.append(...DomInterop.getRenderedChildren(component))
      component.mounted = true

      if (
        !isRerender &&
        "setPromise" in component &&
        typeof component.setPromise === "function"
      ) {
        component.setPromise(promise)
      }

      return f
    }

    if (component.tag === "svg") return DomInterop.svg(component)
    if (!component.element) {
      component.element = document.createElement(component.tag) as T
    }

    if (children) component.replaceChildren(children)

    DomInterop.renderChildren(component)

    DomInterop.updateElement(component)

    component.bindEvents({ onDestroyed })

    if (subscription) component.subscribeTo(subscription)

    component.mounted = true
    if (onMounted) onMounted(component)
    return component.element
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
      if (typeof c === "string" || typeof c === "number") {
        el.append(c.toString())
      } else {
        if (typeof c === "function") {
          const val = c()
          if (typeof val === "string" || typeof val === "number") {
            el.append(val.toString())
          } else {
            el.append(DomInterop.svg(val))
          }
        } else {
          el.append(DomInterop.svg(c))
        }
      }
    }

    //@ts-ignore
    return el as SVGElement
  }

  static getMountLocation(
    component: GenericComponent,
    start = 0
  ): { element: HTMLElement | null; idx: number } {
    if (!component.parent) return { element: null, idx: -1 }
    //if (component.element) start++

    for (let i = 0; i < component.parent.children.length; i++) {
      const c = component.parent.children[i]
      if (Component.isComponent(c) && !c.props.render) continue
      if (c === component) {
        start++
        break
      }
      if (Component.isComponent(c)) {
        if (c.element) start++
      }
    }
    if (component.parent.element)
      return { element: component.parent.element, idx: start }
    return DomInterop.getMountLocation(component.parent, start)
  }
}
