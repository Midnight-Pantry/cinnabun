import { Signal } from "./index.js"
import { Cinnabun } from "./cinnabun.js"
import { Component, FragmentComponent } from "./component.js"
import { ComponentChild, DiffCheckResult, DiffType } from "./types.js"
import { jsPropToHtmlProp, validHtmlProps } from "./utils.js"

export class DomInterop {
  static updateElement(component: Component) {
    if (!component.element) return
    const { children, onMounted, subscription, visible, promise, ...rest } =
      component.props

    if (Object.keys(rest).length) {
      for (const [k, v] of Object.entries(rest)) {
        DomInterop.applyElementProp(component, k, v)
      }
    }
  }

  static applyElementProp(component: Component, k: string, v: any) {
    if (!component.element) return
    if (k.includes(":")) return
    if (["hydrating", "key", "ref", "visible", "watch", "cache"].includes(k))
      return

    if (k === "style") {
      if (typeof v === "object") {
        Object.assign(component.element.style, v)
      } else {
        component.element.setAttribute("style", v)
      }
      return
    }
    if (k === "htmlFor" && "htmlFor" in component.element) {
      component.element.htmlFor = v
      return
    }
    if (k === "contenteditable" && "contentEditable" in component.element) {
      component.element.contentEditable = v
      return
    }

    if (k.startsWith("on")) {
      Object.assign(component.element, { [k]: v })
      return
    }
    if (component.isSVG()) {
      component.element.setAttribute(
        jsPropToHtmlProp(k),
        component.getPrimitive(v, () => DomInterop.updateElement(component))
      )
    } else {
      if (k.includes("-")) {
        component.element.setAttribute(
          k,
          component.getPrimitive(v, () => DomInterop.updateElement(component))
        )
        return
      }

      Object.assign(component.element, {
        [k]: component.getPrimitive(v, () =>
          DomInterop.updateElement(component)
        ),
      })
    }
  }

  static getRenderedChildren(component: Component) {
    return component.children.map((c, i) =>
      DomInterop.renderChild(component, c, i)
    )
  }

  static renderChildren(component: Component) {
    if (!component.props.visible) return
    if (!component.element) return
    DomInterop.removeFuncComponents(component)
    // calling element.replaceChildren does funky things with select state. this is a workaround 😞
    component.element.innerHTML = ""
    component.element.append(...DomInterop.getRenderedChildren(component))
  }

  static renderChild(
    component: Component,
    child: ComponentChild,
    idx: number
  ): string | Node {
    if (Signal.isSignal(child)) {
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
    if (Component.isComponent(child)) {
      if (!child.props.visible || child.isStatic) return ""
      child.parent = component
      return DomInterop.render(child)
    }
    if (typeof child === "function") {
      let c = child(...component.childArgs)
      if (Array.isArray(c)) c = new FragmentComponent(c)
      const res = DomInterop.renderChild(component, c, idx)
      if (Component.isComponent(c)) {
        if (!c.props.visible || c.isStatic) return ""
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
      // handle delayed/cancellable unmounting
      if (!forceSync && component.props.onBeforeUnmounted) {
        const res = component.props.onBeforeUnmounted(component)
        if (res instanceof Promise) {
          res.then((res) => {
            if (res && component.mounted) DomInterop.unRender(component, true)
          })
          return
        } else if (res === false) {
          return
        }
      }

      DomInterop.removeFuncComponents(component)
      if (component.element) {
        component.element.remove()
        component.unMount()
      }
      component.unMount()

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
    const prevChild = element.childNodes[idx > 0 ? idx : 0]

    if (prevChild) {
      element.insertBefore(el, prevChild)
    } else {
      element.appendChild(el)
    }
    component.mounted = true
  }

  static render(component: Component, isRerender: boolean = false) {
    const { children, subscription, promise, renderHtmlAtOwnPeril } =
      component.props
    Cinnabun.removeComponentReferences(component)
    if (renderHtmlAtOwnPeril) {
      const template = document.createElement("template")
      template.innerHTML = renderHtmlAtOwnPeril()
      component.mounted = true
      return template.content
    }

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

    if (subscription) component.subscribeTo(subscription)

    component.mounted = true
    return component.element
  }

  static diffCheckChildren(
    children: Component[],
    newChildren: Component[]
  ): DiffCheckResult[] {
    const childKeys = children.map((c) => c.props.key)
    const newChildKeys = newChildren.map((c) => c.props.key)

    const addedKeys = newChildren
      .filter((c) => !childKeys.includes(c.props.key!))
      .map((c) => c.props.key!)

    const removedKeys = children
      .filter((c) => !newChildKeys.includes(c.props.key!))
      .map((c) => c.props.key!)

    const changedKeys = newChildren
      .filter(
        (c) =>
          !addedKeys.includes(c.props.key!) &&
          !removedKeys.includes(c.props.key!)
      )
      .filter((nc) => {
        const oldChild = children.find((oc) => oc.props.key === nc.props.key)!
        return JSON.stringify(oldChild.props) !== JSON.stringify(nc.props)

        // node equality is not worth it - it's definitely slower and means that
        // external changes to element attributes (style etc...) during runtime will
        // cause the child to be considered 'changed', even for a simple list addition.

        //return !DomInterop.render(nc).isEqualNode(oldChild.element!)
      })
      .map((c) => c.props.key!)

    const unchangedKeys = children
      .filter(
        (c) =>
          !addedKeys.includes(c.props.key!) &&
          !removedKeys.includes(c.props.key!) &&
          !changedKeys.includes(c.props.key!)
      )
      .map((c) => c.props.key!)

    return [
      ...addedKeys.map((k) => {
        return {
          result: DiffType.ADDED,
          key: k,
          node: newChildren.find((c) => c.props.key === k)!.element,
        }
      }),
      ...removedKeys.map((k) => {
        return {
          result: DiffType.REMOVED,
          key: k,
          node: children.find((c) => c.props.key === k)!.element,
        }
      }),
      ...changedKeys.map((k) => {
        return {
          result: DiffType.CHANGED,
          key: k,
          node: children.find((c) => c.props.key === k)!.element,
        }
      }),
      ...unchangedKeys.map((k) => {
        return {
          result: DiffType.NONE,
          key: k,
          node: children.find((c) => c.props.key === k)!.element,
        }
      }),
    ]
  }

  static diffMergeChildren(parent: Component, newChildren: Component[]) {
    const oldChildren = parent.children as Component[]
    try {
      const diffs = DomInterop.diffCheckChildren(oldChildren, newChildren)
      for (let i = 0; i < diffs.length; i++) {
        const diff = diffs[i]
        switch (diff.result) {
          case DiffType.ADDED: {
            const newC = newChildren.find((c) => c.props.key === diff.key)!
            parent.insertChildren(newChildren.indexOf(newC), newC)
            break
          }
          case DiffType.REMOVED: {
            const oldC = (parent.children as (Component | null)[]).find(
              (c) => c?.props.key === diff.key
            )!
            parent.removeChildren(oldC)
            break
          }
          case DiffType.CHANGED: {
            const oldC = (parent.children as (Component | null)[]).find(
              (c) => c?.props.key === diff.key
            )!
            const newC = newChildren.find((c) => c.props.key === diff.key)!
            Cinnabun.removeComponentReferences(newC)
            Object.assign(oldC.props, newC.props)
            DomInterop.updateElement(oldC)

            break
          }
          case DiffType.NONE:
          default:
            // {
            //   // recurse into children and ensure they are up to date
            //   const oldC = parent.children.find(
            //     (c) => c instanceof Component && c.props.key === diff.key
            //   ) as Component
            //   const newC = newChildren.find(
            //     (c) => c instanceof Component && c.props.key === diff.key
            //   )
            //   if (newC) Cinnabun.removeComponentReferences(newC)
            //   if (oldC && newC) {
            //     DomInterop.diffMergeChildren(
            //       oldC,
            //       newC.children.filter(
            //         (c) => c instanceof Component
            //       ) as Component[]
            //     )
            //   }
            // }

            break
        }
      }
    } catch (error) {
      console.error("failed to diff merge children", parent, newChildren, error)
    }
    parent.children = parent.children.filter((c) => c !== null)
  }

  static svg(component: Component): SVGSVGElement {
    const el = document.createElementNS(
      "http://www.w3.org/2000/svg",
      component.tag
    )

    const { visible, ...props } = component.props

    const validProps = Object.entries(validHtmlProps(props))

    for (const [k, v] of validProps) {
      // convert camelCase to kebab-case
      //const _k = k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
      // skip bind: props
      if (k.includes("bind:")) continue
      // convert className to class
      const _k2 = k === "className" ? "class" : k

      el.setAttribute(_k2, v.toString())
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

    for (let i = 0; i < component.parent.children.length; i++) {
      const c = component.parent.children[i]
      if (c === component) {
        break
      }
      start += DomInterop.getRenderedNodeCount(c)
    }
    if (component.parent.element)
      return { element: component.parent.element, idx: start }

    return DomInterop.getMountLocation(component.parent, start)
  }

  static getRenderedNodeCount(child: ComponentChild): number {
    let count = 0
    if (Component.isComponent(child)) {
      if (!child.props.visible) return 0
      if (child.tag) return 1

      for (const c of child.children) {
        count += DomInterop.getRenderedNodeCount(c)
      }
      for (const c of child.funcComponents) {
        count += DomInterop.getRenderedNodeCount(c)
      }
    } else if (child instanceof Signal) {
      count++
    } else if (typeof child === "string" || typeof child === "number") {
      count++
    }

    return count
  }
}
