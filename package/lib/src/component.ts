import {
  Cinnabun,
  addComponentReference,
  componentReferences,
  setComponentReferences,
} from "./cinnabun"

import { Signal } from "./signal"
import {
  ComponentSubscription,
  ComponentProps,
  ComponentChild,
  ComponentEventProps,
  GenericComponent,
  ClassConstructor,
  RouteProps,
} from "./types"

export class Component<T extends HTMLElement> {
  parent: Component<any> | null = null
  children: ComponentChild[] = []
  funcElements: HTMLElement[] = []
  element: T | undefined
  promise: { (): Promise<any> } | undefined
  promiseCache: any
  mounted: boolean = false

  private subscription: ComponentSubscription | undefined
  private _props: ComponentProps<T> = {}
  constructor(public tag: string, props: ComponentProps<T> = {}) {
    this.props = props
    if (typeof this._props.render === "undefined") this._props.render = true
  }
  get props() {
    return this._props
  }
  set props(props: ComponentProps<T>) {
    const { children, watch, ...rest } = props

    Object.assign(this._props, rest)
    if (children) {
      if (this.validateChildren(children)) this.replaceChildren(children)
    }

    if (watch && watch instanceof Signal) {
      const unsub = watch.subscribe(this.applyBindProps.bind(this))
      addComponentReference({
        component: this,
        onDestroyed: () => unsub(),
      })
    }
  }

  get childArgs(): any[] {
    return []
  }

  validateChildren(children: ComponentChild[] = []): boolean {
    if (children.some((c) => Array.isArray(c))) {
      console.error("Error: Cannot render child of type Array", children)
      return false
    }
    return true
  }

  handlePromise(
    onfulfilled?: ((value: any) => void | PromiseLike<void>) | null | undefined,
    onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined
  ) {
    if (onfulfilled) {
      this.promiseCache = onfulfilled
      this.unRender()
      this.reRender()
      if (!this._props.cache) this.promiseCache = undefined
    } else if (onrejected) {
      console.error("handlePromise() - unhandle case 'onrejected'")
      debugger //todo
    } else {
      console.error("handlePromise() - unhandle case 'unknown'")
      debugger //todo
    }
  }

  shouldRender(): boolean {
    if (!this._props.render) return false
    if (this.parent) return this.parent?.shouldRender()
    return true
  }

  reRender() {
    if (!this.shouldRender()) return
    const { element, idx } = this.getMountLocation()
    let thisEl = this.element ?? this.render(true)
    if (element) {
      const c = element.children[idx]
      if (c) {
        element.insertBefore(thisEl, c)
      } else {
        element.append(thisEl)
      }
    }
  }

  applyBindProps() {
    const bindFns = Object.entries(this.props).filter(([k]) =>
      k.startsWith("bind:")
    )
    if (bindFns.length > 0) {
      for (const [k, v] of bindFns) {
        const propName = k.substring(k.indexOf(":") + 1)
        this._props[propName] = this.getPrimitive(v, this.renderChildren)

        if (propName === "render") {
          if (!this._props.render || !this.parent?._props.render) {
            this.unRender()
          } else if (this._props.render) {
            this.reRender()
          }
        } else if (propName === "children") {
          if (this._props.children) this.replaceChildren(this._props.children)
          this.renderChildren()
        } else if (this.element) {
          Object.assign(this.element, { [propName]: this._props[propName] })
        }
      }
    }
  }

  getPrimitive(prop: any, signalCallback: { (): void }): any {
    if (prop instanceof Signal) {
      this.subscribeTo((_, __) => prop.subscribe(signalCallback.bind(this)))
      return prop.value
    }
    if (typeof prop === "function")
      return this.getPrimitive(prop(), signalCallback)
    return prop
  }

  render(isRerender: boolean = false): T | Node {
    const {
      children,
      onMounted,
      onChange,
      onClick,
      onDestroyed,
      subscription,
      promise,
    } = this.props

    setComponentReferences((arr) => arr.filter((c) => c.component !== this))

    if (!this.tag) {
      const f = document.createDocumentFragment()
      if (subscription) this.subscribeTo(subscription)
      f.append(...this.getRenderableChildren().map((c) => this.renderChild(c)))
      this.mounted = true

      if (!isRerender && this instanceof SuspenseComponent) {
        if (!this.promise && promise) {
          this.promise = promise as { (): Promise<any> }
          this.promise().then(this.handlePromise.bind(this))
        } else if (this.promise && !this._props.cache) {
          this.promise().then(this.handlePromise.bind(this))
        }
      }

      return f
    }

    if (this.tag === "svg") return Cinnabun.svg(this)
    if (!this.element) {
      this.element = document.createElement(this.tag) as T
      this.bindEvents({
        onChange,
        onClick,
      })
    }

    if (children) this.replaceChildren(children)

    this.renderChildren()

    this.updateElement()

    this.bindEvents({ onDestroyed })

    if (subscription) this.subscribeTo(subscription)

    this.mounted = true
    if (onMounted) onMounted(this)
    return this.element
  }

  bindEvents({ onChange, onClick, onDestroyed }: ComponentEventProps<T>) {
    if (this.element) {
      if (onChange) {
        this.element.addEventListener("change", onChange)
        addComponentReference({
          component: this,
          onDestroyed: () =>
            this.element!.removeEventListener("change", onChange),
        })
      }
      if (onClick) {
        const fn = (e: Event) => onClick(e, this)
        this.element.addEventListener("click", fn)
        addComponentReference({
          component: this,
          onDestroyed: () => this.element!.removeEventListener("click", fn),
        })
      }
    }
    if (onDestroyed) {
      addComponentReference({
        component: this,
        onDestroyed: () => onDestroyed(this),
      })
    }
  }

  updateElement() {
    if (!this.element) return
    const {
      htmlFor,
      children,
      onMounted,
      onChange,
      onClick,
      onDestroyed,
      subscription,
      render,
      style,
      promise,
      ...rest
    } = this.props

    if (style) Object.assign(this.element.style, style)
    if (htmlFor && "htmlFor" in this.element) this.element.htmlFor = htmlFor

    if (Object.keys(rest).length) {
      for (const [k, v] of Object.entries(rest)) {
        Object.assign(this.element, {
          [k]: this.getPrimitive(v, this.updateElement),
        })
      }
    }
  }

  getRenderableChildren() {
    return this.children.filter(
      (c) =>
        typeof c === "function" ||
        typeof c === "string" ||
        (c instanceof Component && c._props.render) ||
        c instanceof Signal
    )
  }

  unRender() {
    if (this.funcElements.length > 0) {
      for (const fc of this.funcElements) {
        fc.remove()
      }
      this.funcElements = []
    }
    if (this.element) return this.element.remove()
    for (const c of this.children) {
      if (c instanceof Component<any>) {
        c.unRender()
      } else if (c instanceof Node) {
        c.parentNode?.removeChild(c)
      }
    }
  }

  renderChildren() {
    if (!this.props.render) return
    if (!this.element) return

    const children = this.getRenderableChildren().map(
      this.renderChild.bind(this)
    )
    this.element.replaceChildren(...children)
  }

  renderChild(child: any): string | Node {
    if (child instanceof Signal) {
      this.subscribeTo((_, __) =>
        child.subscribe(this.renderChildren.bind(this))
      )
      return child.value.toString()
    }
    if (child instanceof Component) return child.render()
    if (typeof child === "function") {
      const res = this.renderChild(child(...this.childArgs))
      //@ts-ignore
      this.funcElements = Array.isArray(res) ? res : [res]
      return res
    }
    return child
  }

  subscribeTo(subscription: ComponentSubscription) {
    if (this.subscription) return
    this.subscription = subscription

    const setProps = (props: ComponentProps<T>) => {
      this.props = Object.assign(this.props, props)
    }
    const unsubscriber = this.subscription(setProps, this as Component<any>)
    addComponentReference({
      component: this,
      onDestroyed: () => unsubscriber(),
    })
  }

  getMountLocation(start = 0): { element: HTMLElement | null; idx: number } {
    if (!this.parent) return { element: null, idx: -1 }
    for (let i = 0; i < this.parent.children.length; i++) {
      const c = this.parent.children[i]
      if (c instanceof Component && !c._props.render) continue
      if (c === this) break
      start++
    }
    if (this.parent.element) return { element: this.parent.element, idx: start }
    return this.parent.getMountLocation(start)
  }

  replaceChildren(newChildren: ComponentChild[]) {
    this.destroyChildComponentRefs(this)
    this.children = newChildren
    for (let i = 0; i < this.children.length; i++) {
      const c = this.children[i]
      if (c instanceof Component) c.parent = this
    }
  }

  destroyChildComponentRefs(el: Component<any>) {
    for (const c of el.children) {
      if (typeof c === "string") continue
      const val = typeof c === "function" ? c(...this.childArgs) : c
      if (typeof val !== "string") this.destroyComponentRefs(val)
    }
  }

  destroyComponentRefs(el: Component<any>) {
    this.destroyChildComponentRefs(el)
    el.parent = null
    const subs = componentReferences.filter((s) => s.component === el)
    while (subs.length) {
      subs.pop()!.onDestroyed()
    }
    setComponentReferences((arr) => arr.filter((s) => s.component !== el))
  }

  onDestroy() {
    if (this.props.onDestroyed) this.props.onDestroyed(this)
  }

  getParentOfType<Class extends ClassConstructor<Component<any>>>(
    classRef: Class
  ): InstanceType<Class> | undefined {
    if (!this.parent) return undefined
    if (this.parent instanceof classRef)
      return this.parent as InstanceType<Class>
    return undefined
  }
}

export class SuspenseComponent extends Component<any> {
  get childArgs(): any[] {
    return [!this.promiseCache, this.promiseCache]
  }
  resetPromise() {
    this.promise = undefined
    this.promiseCache = undefined
  }
}

export class FragmentComponent extends Component<any> {
  constructor(children: ComponentChild[]) {
    super("", { children })
  }
}

export class RouterComponent extends Component<any> {
  constructor(subscription: ComponentSubscription, children: RouteComponent[]) {
    super("", { subscription, children })
  }

  getParentPath() {
    let parentPath = ""
    let parentRoute = this.getParentOfType(RouteComponent)

    while (parentRoute) {
      parentPath = parentRoute.props.path + parentPath
      parentRoute = parentRoute.getParentOfType(RouteComponent)
    }
    return parentPath
  }
}

export class RouteComponent extends Component<any> {
  constructor(path: string, component: Component<any>) {
    super("", {
      path,
      pathDepth: path.split("").filter((chr) => chr === "/").length,
      children: [component],
      render: false,
    })
  }
}
