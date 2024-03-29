import { Cinnabun } from "./cinnabun.js"
import { DomInterop } from "./domInterop.js"

import { Signal } from "./signal.js"
import {
  ComponentSubscription,
  ComponentProps,
  ComponentChild,
  ComponentChildren,
  TemplateFunc,
  ForProps,
  SuspenseProps,
  ComponentFunc,
} from "./types.js"

export class Component {
  parent: Component | null = null
  children: ComponentChild[] = []
  funcComponents: Component[] = []
  element: HTMLElement | SVGSVGElement | undefined
  cbInstance: Cinnabun | undefined
  isStatic: boolean = false

  static isComponent(obj: any): obj is Component {
    if (typeof obj !== "object") return false
    return (
      obj instanceof Component ||
      [
        "parent",
        "children",
        "funcComponents",
        "element",
        "cbInstance",
        "isStatic",
        "props",
      ].every((k) => k in obj)
    )
  }

  static isComponentChild(obj: any): obj is ComponentChild {
    return (
      typeof obj === "string" ||
      typeof obj === "number" ||
      typeof obj === "function" ||
      Component.isComponent(obj)
    )
  }

  private _mounted: boolean = false
  get mounted() {
    return this._mounted
  }
  set mounted(val: boolean) {
    const changed = this._mounted !== val
    this._mounted = val
    if (changed && val && this._props.onMounted) {
      setTimeout(() => {
        this._props.onMounted!(this)
      }, 0)
    } else if (changed && !val && this._props.onUnmounted) {
      this._props.onUnmounted(this)
    }

    if (changed && this._props.ref) {
      this._props.ref.value = this.mounted && this.element ? this.element : null
    }
  }

  private subscription: ComponentSubscription | undefined
  private _props: ComponentProps = {}
  constructor(public tag: string, props: ComponentProps = {}) {
    if (!("visible" in props)) props.visible = true
    this.props = props
  }
  get props() {
    return this._props
  }
  set props(props: ComponentProps) {
    const { children, watch, ...rest } = props

    Object.assign(this._props, rest)
    if (children) this.replaceChildren(children)

    if (Cinnabun.isClient && watch) {
      this._props.watch = watch
      const signals = "length" in watch ? watch : [watch]
      for (const s of signals) {
        const unsub = s.subscribe(this.applyBindProps.bind(this))
        Cinnabun.addComponentReference({
          component: this,
          onDestroyed: () => unsub(),
        })
      }
    }
    //if (this.props.ref) this.props.ref.value = this.element ?? null
  }

  get childArgs(): any[] {
    return []
  }

  applyBindProps() {
    const bindFns = Object.entries(this.props).filter(([k]) =>
      k.startsWith("bind:")
    )
    for (const [k, v] of bindFns) {
      const propName = k.substring(k.indexOf(":") + 1)
      const val = this.getPrimitive(v, () => DomInterop.reRender(this))
      const oldVal = this._props[propName]
      this._props[propName] =
        propName === "children" && val === true ? oldVal : val

      if (propName === "visible" && Cinnabun.isClient) {
        if (val !== oldVal) {
          if (val && this.parent?._props.visible) {
            DomInterop.reRender(this)
          } else {
            if (this.mounted) DomInterop.unRender(this)
          }
        }
      } else if (propName === "children") {
        if (this._props.children) this.replaceChildren(this._props.children)
        if (Cinnabun.isClient) DomInterop.renderChildren(this)
      } else if (this.element) {
        DomInterop.applyElementProp(this, propName, val)
      }
    }
  }

  getPrimitive(prop: any, signalCallback?: { (): void }): any {
    if (Signal.isSignal(prop)) {
      if (signalCallback)
        this.subscribeTo((_, __) => prop.subscribe(signalCallback.bind(this)))
      return prop.value
    }
    if (typeof prop === "function")
      return this.getPrimitive(prop(this), signalCallback)
    return prop
  }

  subscribeTo(subscription: ComponentSubscription) {
    if (this.subscription) return
    this.subscription = subscription

    const setProps = (props: ComponentProps) => {
      this.props = Object.assign(this.props, props)
    }
    const unsubscriber = this.subscription(setProps, this)
    Cinnabun.addComponentReference({
      component: this,
      onDestroyed: () => unsubscriber(),
    })
  }

  removeChildren(...children: ComponentChildren) {
    for (const child of children) {
      const idx = this.children.indexOf(child)
      if (Component.isComponent(child)) {
        this.destroyComponentRefs(child)
        child.parent = null
        DomInterop.unRender(child)
      }
      this.children[idx] = null
    }
  }

  insertChildren(index: number, ...children: ComponentChildren) {
    this.children.splice(index, 0, ...children)
    for (const child of children) {
      if (Component.isComponent(child)) {
        child.parent = this
        DomInterop.reRender(child)
      }
    }
  }

  appendChildren(...children: ComponentChildren) {
    this.children.push(...children)
    for (const child of children) {
      if (Component.isComponent(child)) {
        child.parent = this
        DomInterop.reRender(child)
      }
    }
  }

  prependChildren(...children: ComponentChildren) {
    this.children.unshift(...children)
    for (const child of children) {
      if (Component.isComponent(child)) {
        child.parent = this
        DomInterop.reRender(child)
      }
    }
  }

  replaceChild(child: Component, newChild: Component) {
    DomInterop.unRender(child)
    this.destroyComponentRefs(child)
    const idx = this.children.indexOf(child)
    this.children[idx] = newChild
    newChild.parent = this
    DomInterop.reRender(newChild)
  }
  replaceChildren(newChildren: ComponentChild[]) {
    this.destroyChildComponentRefs(this)
    this.children = newChildren.map((c) =>
      Array.isArray(c) ? new FragmentComponent(c) : c
    )
    this.linkChildren()
  }

  linkChildren() {
    for (let i = 0; i < this.children.length; i++) {
      const c = this.children[i]
      if (Component.isComponent(c)) {
        c.parent = this
        c.cbInstance = this.cbInstance
        c.linkChildren()
      }
    }
  }

  destroyChildComponentRefs(el: Component) {
    for (const c of el.children) {
      if (typeof c === "string" || typeof c === "number") continue
      if (typeof c === "function") continue
      if (!c) continue
      this.destroyComponentRefs(c)
    }
  }

  shouldRender(): boolean {
    if (!this._props.visible) return false
    if (this.parent) return this.parent.shouldRender()
    return true
  }

  destroyComponentRefs(el: Component) {
    this.destroyChildComponentRefs(el)
    //el.parent = null
    const subs = Cinnabun.getComponentReferences(el).filter(
      (s) => s.component === el
    )
    while (subs.length) {
      subs.pop()!.onDestroyed()
    }
    Cinnabun.removeComponentReferences(el)
  }

  onDestroy() {
    if (this.props.onDestroyed) this.props.onDestroyed(this)
  }

  unMount() {
    for (const c of this.children) {
      if (Component.isComponent(c)) c.unMount()
    }
    this.mounted = false
  }

  recursiveCall(func: { (c: Component): void }) {
    func(this)
    for (const c of this.children) {
      if (Component.isComponent(c)) c.recursiveCall(func)
    }
  }

  isSVG(): boolean {
    try {
      return this.tag.toLowerCase() === "svg" || !!this.element?.closest("svg")
    } catch (error) {
      console.error("isSVG ERROR", this.element)
      return false
    }
  }

  useRequestData<T>(requestDataPath: string, fallback: T) {
    return Cinnabun.isClient
      ? fallback
      : this.cbInstance?.getServerRequestData<T>(requestDataPath)
  }
}

export class FragmentComponent extends Component {
  constructor(children: ComponentChild[] = []) {
    super("", { children })
  }
}

export class ForComponent<T> extends Component {
  constructor(items: Signal<T[]> | T[], mapPredicate: TemplateFunc<T>) {
    const reactiveItems = Signal.isSignal(items) ? items : new Signal(items)

    super("", {
      subscription: (_, self) =>
        reactiveItems.subscribe((newItems) => {
          const newChildren = newItems.map(mapPredicate)
          // check if all children have a key and the key is unique
          // if not, we can't do partial rerendering
          let uniqueKeys = true
          for (const child of newChildren) {
            //prettier-ignore
            if (newChildren.filter((c:Component) => c.props.key === child.props.key).length > 1) {
              uniqueKeys = false
              console.error("non-unique key found in <For/>", child.props.key)
              console.error(
                "Children of <For/> must have unique keys, and they should not be index-based - expect bugs!"
              )
              break
            }
          }
          // ssr doesn't need to worry about partial rerendering, so we can just replace the children
          if (!Cinnabun.isClient) return self.replaceChildren(newChildren)
          // if we have unique keys, we can do partial rerendering
          if (uniqueKeys && !self.props.hydrating)
            return DomInterop.diffMergeChildren(self, newChildren)
          // otherwise, we have to do a full rerender
          DomInterop.unRender(self)
          self.replaceChildren(newChildren)
          DomInterop.reRender(self)
        }),
    })
  }
}

/**
 * @description
 * A component that renders a list of items
 * @example
 * ```tsx
 * <For
 *   each={products}
 *   template={(p) => <ProductCard product={p} />}
 * />
 * ```
 */
export function For<T>(
  { each, template }: ForProps<T>,
  templateChild: [TemplateFunc<T>]
): Component {
  return new ForComponent<T>(each, template ?? templateChild[0])
}

export class SuspenseComponent extends Component {
  promiseFunc: { (): Promise<any> } | undefined
  promiseInstance: Promise<any> | undefined
  promiseCache: any
  promiseLoading: boolean = true

  constructor(props: SuspenseProps, children: [ComponentFunc]) {
    super("", { ...props, children })
  }

  get childArgs(): any[] {
    return [this.promiseLoading, this.promiseCache]
  }
  resetPromise() {
    this.promiseLoading = true
    this.promiseFunc = undefined
    this.promiseCache = undefined
  }
  handlePromise(
    onfulfilled?: ((value: any) => void | PromiseLike<void>) | null | undefined,
    onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined
  ) {
    this.promiseLoading = false
    if (onrejected) {
      console.error("handlePromise() - unhandle case 'onrejected'")
      debugger //todo
      return
    }
    this.promiseCache = onfulfilled
    if (Cinnabun.isClient) {
      DomInterop.unRender(this)
      DomInterop.reRender(this)
    }
  }

  setPromise(promise: { (): Promise<any> }) {
    if (!this.promiseFunc && promise) {
      this.promiseLoading = true
      this.promiseFunc = promise
      this.promiseInstance = this.promiseFunc()
      this.promiseInstance.then(this.handlePromise.bind(this))
    } else if (this.promiseFunc && !this.props.cache) {
      this.promiseLoading = true
      this.promiseInstance = this.promiseFunc()
      this.promiseInstance.then(this.handlePromise.bind(this))
    }
  }
}

/**
 * A component that renders a fallback while waiting for a promise to resolve.
 * - You can optionally cache the promise result using the **cache** flag.
 * - When used with SSR you can also:
 *    - Use the **prefetch** flag to fetch the data and render on the server, resulting in no 'loading' _(this will halt rendering until the promise resolves, but may be useful for SEO or security)_
 *    - Use the **prefetch:defer** flag to asynchronously load the data on the server and give the results back to the client as part of the initial request
 * ---
 * @example
 * ##### - using cache
 * ```tsx
 * <Suspense promise={fetchData} cache>
 *  {(loading, data) => {
 *    if (loading) return <Loading />
 *    return <YourComponent data={data} />
 *  }}
 * </Suspense>
 * ```
 *
 * ##### - using prefetch:defer
 * ```tsx
 * <Suspense promise={fetchData} prefetch:defer>
 *  {(loading, data) => {
 *    if (loading) return <Loading />
 *    return <YourComponent data={data} />
 *  }}
 * </Suspense>
 * ```
 */
export const Suspense = (props: SuspenseProps, children: [ComponentFunc]) => {
  return new SuspenseComponent(props, children)
}

export const RawHtml = (
  props: ComponentProps & { html?: string },
  ...children: string[]
) => {
  const { html, ...rest } = props
  return new Component("", {
    renderHtmlAtOwnPeril: () => (html ?? "").concat(children.join("")),
    ...rest,
  })
}
