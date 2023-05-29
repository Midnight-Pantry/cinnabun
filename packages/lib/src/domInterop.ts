import { Component, Signal } from "."
import { Cinnabun } from "./cinnabun"
import { FragmentComponent } from "./component"
import { ComponentChild, DiffCheckResult, DiffType } from "./types"

export class DomInterop {
  static updateElement(component: Component) {
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

    const isSVG = component.isSVG()

    if (style) {
      if (typeof style === "object") {
        Object.assign(component.element.style, style)
      } else {
        component.element.setAttribute("style", style)
      }
    }
    if (htmlFor && "htmlFor" in component.element) {
      component.element.htmlFor = htmlFor
    }
    if (Object.keys(rest).length) {
      for (const [k, v] of Object.entries(rest)) {
        if (k.includes("bind:")) continue
        if (k.startsWith("on")) {
          Object.assign(component.element, { [k]: v })
          continue
        }
        if (isSVG) {
          component.element.setAttribute(
            k,
            component.getPrimitive(v, () => DomInterop.updateElement(component))
          )
        } else {
          Object.assign(component.element, {
            [k]: component.getPrimitive(v, () =>
              DomInterop.updateElement(component)
            ),
          })
        }
      }
    }
  }

  static getRenderedChildren(component: Component) {
    return component.children.map((c, i) =>
      DomInterop.renderChild(component, c, i)
    )
  }

  static renderChildren(component: Component) {
    if (!component.props.render) return
    if (!component.element) return
    DomInterop.removeFuncComponents(component)

    component.element.replaceChildren(
      ...DomInterop.getRenderedChildren(component)
    )
  }

  static renderChild(
    component: Component,
    child: ComponentChild,
    idx: number
  ): string | Node {
    if (child instanceof Signal) {
      component.subscribeTo((_, __) =>
        child.subscribe(() => {
          const { element } = component.element
            ? { element: component.element }
            : DomInterop.getMountLocation(component)
          if (!element) {
            console.error(
              "Failed to get component mount element",
              component,
              child
            )
            return
          }
          const c = element.childNodes[idx]
          if (c) c.nodeValue = child.value.toString()
        })
      )
      return child.value.toString()
    }
    if (child instanceof Component) {
      if (!child.props.render) return ""
      return DomInterop.render(child)
    }
    if (typeof child === "function") {
      let c = child(...component.childArgs)
      if (Array.isArray(c)) c = new FragmentComponent(c)
      const res = DomInterop.renderChild(component, c, idx)
      if (c instanceof Component) {
        if (!c.props.render) return ""
        c.parent = component
        component.funcComponents.push(c)
      }
      return res
    }
    return child?.toString() ?? ""
  }

  static removeFuncComponents(component: Component) {
    if (component.funcComponents.length > 0) {
      for (const fc of component.funcComponents) {
        DomInterop.unRender(fc)
        Cinnabun.removeComponentReferences(fc)
      }
      component.funcComponents = []
    }
  }

  static unRender(component: Component, forceSync: boolean = false) {
    try {
      if (!forceSync && component.props.onBeforeUnmounted) {
        component.props.onBeforeUnmounted(component)?.then((res) => {
          if (res) DomInterop.unRender(component, true)
        })
        return
      }

      DomInterop.removeFuncComponents(component)
      if (component.element) {
        component.unMount()
        return component.element.remove()
      }
      for (const c of component.children) {
        if (c instanceof Component) {
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

  static reRender(component: Component) {
    if (!component.shouldRender()) return
    const el = component.element ?? DomInterop.render(component, true)
    if (component.element) DomInterop.renderChildren(component)
    if (el.isConnected) return

    const { element, idx } = DomInterop.getMountLocation(component)
    if (!element) {
      debugger
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
    component.mounted = true
  }

  static render(component: Component, isRerender: boolean = false) {
    const { children, onDestroyed, subscription, promise } = component.props

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

    if (component.tag.toLowerCase() === "svg") return DomInterop.svg(component)
    if (!component.element) {
      component.element = document.createElement(component.tag) as HTMLElement
    }

    if (children) component.replaceChildren(children)

    DomInterop.renderChildren(component)

    DomInterop.updateElement(component)

    component.bindEvents({ onDestroyed })

    if (subscription) component.subscribeTo(subscription)

    component.mounted = true
    return component.element
  }

  static diffCheckChildren(
    children: Component[],
    newChildren: Component[]
  ): DiffCheckResult[] {
    let res: DiffCheckResult[] = []
    const len = Math.max(children.length, newChildren.length)
    let i = 0
    while (i < len) {
      res.push(DomInterop.diffCheckChild(i, children[i], newChildren[i]))
      i++
    }
    return res
  }

  static diffCheckChild(
    index: number,
    a?: Component,
    b?: Component
  ): DiffCheckResult {
    if (!a && b) {
      return {
        index,
        result: DiffType.ADDED,
      }
    }
    if (a && !b) {
      return {
        index,
        result: DiffType.REMOVED,
        node: a.element,
      }
    }

    if (a && b) {
      const el1 = a.element ?? null
      const el2 = b.element ?? DomInterop.render(b)
      if (!el1 && !el2)
        return {
          index,
          result: DiffType.NONE,
        }

      if ((el1 && !el2) || (el2 && !el1))
        return {
          index,
          result: DiffType.CHANGED,
          node: b.element,
        }

      if (!el1?.isEqualNode(el2)) {
        return {
          index,
          result: DiffType.CHANGED,
          node: b.element,
        }
      }
    }

    return {
      index,
      result: DiffType.NONE,
    }
  }

  static diffMergeChildren(parent: Component, newChildren: Component[]) {
    const diffs = DomInterop.diffCheckChildren(
      parent.children as Component[],
      newChildren
    )
    const rerenderList: number[] = []
    for (let i = 0; i < diffs.length; i++) {
      const { index, result } = diffs[i]
      switch (result) {
        case DiffType.ADDED:
          parent.insertChild(newChildren[index], index)
          break
        case DiffType.REMOVED:
          parent.removeChild(parent.children[index])
          break
        case DiffType.CHANGED:
          rerenderList.push(index)
          break
        case DiffType.NONE:
        default:
          break
      }
    }
    for (let i = 0; i < rerenderList.length; i++) {
      const idx = rerenderList[i]
      const child = parent.children[idx] as Component
      //child.element?.replaceWith(newChildren[idx].element ?? "")
      Object.assign(child.props, newChildren[idx].props)
      child.replaceChildren(newChildren[idx].children)
      DomInterop.reRender(child)
    }
  }

  static svg(component: Component): SVGSVGElement {
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
          if (c) el.append(DomInterop.svg(c))
        }
      }
    }

    //@ts-ignore
    return el as SVGElement
  }

  static getMountLocation(
    component: Component,
    start = 0
  ): { element: HTMLElement | SVGSVGElement | null; idx: number } {
    if (!component.parent) return { element: null, idx: -1 }
    //if (component.element) start++

    for (let i = 0; i < component.parent.children.length; i++) {
      const c = component.parent.children[i]
      if (c instanceof Component && !c.props.render) continue
      if (c === component) {
        start++
        break
      }
      if (c instanceof Component) {
        if (c.element) start++
      }
    }
    if (component.parent.element)
      return { element: component.parent.element, idx: start }
    return DomInterop.getMountLocation(component.parent, start)
  }
}
