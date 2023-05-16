import { Component } from "./component.js"
import { Signal } from "./signal.js"
import { Cinnabun } from "./cinnabun.js"

export class DomInterop {
  /** @param {Component} component */
  static updateElement(component) {
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
    } = component.getProps()

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

  /** @param {Component} component */
  static getRenderedChildren(component) {
    return DomInterop.getRenderableChildren(component).map((c) =>
      DomInterop.renderChild(component, c)
    )
  }

  /** @param {Component} component */
  static getRenderableChildren(component) {
    return component.children.filter(
      (c) =>
        typeof c === "function" ||
        typeof c === "string" ||
        typeof c === "number" ||
        (Component.isComponent(c) && c.getProps().render) ||
        Signal.isSignal(c)
    )
  }

  /** @param {Component} component */
  static renderChildren(component) {
    if (!component.getProps().render) return
    if (!component.element) return
    DomInterop.removeFuncComponents(component)

    component.element.replaceChildren(
      ...DomInterop.getRenderedChildren(component)
    )
  }

  /**
   *
   * @param {Component} component
   * @param {import("./types.js").ComponentChild} child
   * @returns {string | Node}
   */
  static renderChild(component, child) {
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

  /** @param {Component} component */
  static removeFuncComponents(component) {
    if (component.funcComponents.length > 0) {
      for (const fc of component.funcComponents) {
        DomInterop.unRender(fc)
        Cinnabun.removeComponentReferences(fc)
      }
      component.funcComponents = []
    }
  }

  /** @param {Component} component */
  static unRender(component) {
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

  /** @param {Component} component */
  static reRender(component) {
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

  /**
   * @param {Component} component
   * @param {boolean} [isRerender=false]
   * @returns {HTMLElement | Node}
   */
  static render(component, isRerender = false) {
    const { children, onMounted, onDestroyed, subscription, promise } =
      component.getProps()

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
      component.element = document.createElement(component.tag)
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

  /**
   *
   * @param {Component} component
   * @returns {SVGElement}
   */
  static svg(component) {
    const el = document.createElementNS(
      "http://www.w3.org/2000/svg",
      component.tag
    )

    const { render, ...props } = component.getProps()

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

    return el
  }

  /**
   * @param {Component} component
   * @param {number} [start=0]
   * @returns {{ element: HTMLElement | null, idx: number }}
   */
  static getMountLocation(component, start = 0) {
    if (!component.parent) return { element: null, idx: -1 }
    //if (component.element) start++

    for (let i = 0; i < component.parent.children.length; i++) {
      const c = component.parent.children[i]
      if (Component.isComponent(c) && !c.getProps().render) continue
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
