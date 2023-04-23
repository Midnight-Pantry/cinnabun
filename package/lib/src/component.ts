import { Cinnabun } from "./cinnabun"
import { DomInterop } from "./domInterop"

import { Signal } from "./signal"
import {
  ComponentSubscription,
  ComponentProps,
  ComponentChild,
  ComponentEventProps,
  ClassConstructor,
} from "./types"

export class Component<T extends HTMLElement> {
  parent: Component<any> | null = null
  children: ComponentChild[] = []
  funcElements: HTMLElement[] = []
  element: T | undefined

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
      Cinnabun.addComponentReference({
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

  applyBindProps() {
    const bindFns = Object.entries(this.props).filter(([k]) =>
      k.startsWith("bind:")
    )
    if (bindFns.length > 0) {
      for (const [k, v] of bindFns) {
        const propName = k.substring(k.indexOf(":") + 1)

        // possibly shouldn't be using this.renderChildren?
        this._props[propName] = this.getPrimitive(v, () =>
          DomInterop.renderChildren(this)
        )

        if (propName === "render" && Cinnabun.isClient) {
          //debugger
          if (!this._props.render || !this.parent?._props.render) {
            DomInterop.unRender(this)
          } else if (this._props.render) {
            DomInterop.reRender(this)
          }
        } else if (propName === "children") {
          if (this._props.children) this.replaceChildren(this._props.children)
          if (Cinnabun.isClient) DomInterop.renderChildren(this)
        } else if (this.element) {
          Object.assign(this.element, { [propName]: this._props[propName] })
        }
      }
    }
  }

  getPrimitive(prop: any, signalCallback?: { (): void }): any {
    if (prop instanceof Signal) {
      if (signalCallback)
        this.subscribeTo((_, __) => prop.subscribe(signalCallback.bind(this)))
      return prop.value
    }
    if (typeof prop === "function")
      return this.getPrimitive(prop(), signalCallback)
    return prop
  }

  subscribeTo(subscription: ComponentSubscription) {
    if (this.subscription) return
    this.subscription = subscription

    const setProps = (props: ComponentProps<T>) => {
      this.props = Object.assign(this.props, props)
    }
    const unsubscriber = this.subscription(setProps, this as Component<any>)
    Cinnabun.addComponentReference({
      component: this,
      onDestroyed: () => unsubscriber(),
    })
  }

  bindEvents({ onChange, onClick, onDestroyed }: ComponentEventProps<T>) {
    if (this.element) {
      if (onChange) {
        this.element.addEventListener("change", onChange)
        Cinnabun.addComponentReference({
          component: this,
          onDestroyed: () =>
            this.element!.removeEventListener("change", onChange),
        })
      }
      if (onClick) {
        const fn = (e: Event) => onClick(e, this)
        this.element.addEventListener("click", fn)
        Cinnabun.addComponentReference({
          component: this,
          onDestroyed: () => this.element!.removeEventListener("click", fn),
        })
      }
    }
    if (onDestroyed) {
      Cinnabun.addComponentReference({
        component: this,
        onDestroyed: () => onDestroyed(this),
      })
    }
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
      if (typeof c === "string" || typeof c === "number") continue
      const val = typeof c === "function" ? c(...this.childArgs) : c
      if (typeof val !== "string") this.destroyComponentRefs(val)
    }
  }

  shouldRender(): boolean {
    if (!this._props.render) return false
    if (this.parent) return this.parent?.shouldRender()
    return true
  }

  destroyComponentRefs(el: Component<any>) {
    this.destroyChildComponentRefs(el)
    el.parent = null
    const subs = Cinnabun.componentReferences.filter((s) => s.component === el)
    while (subs.length) {
      subs.pop()!.onDestroyed()
    }
    Cinnabun.setComponentReferences((arr) =>
      arr.filter((s) => s.component !== el)
    )
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
  promise: { (): Promise<any> } | undefined
  promiseCache: any

  get childArgs(): any[] {
    return [!this.promiseCache, this.promiseCache]
  }
  resetPromise() {
    this.promise = undefined
    this.promiseCache = undefined
  }
  handlePromise(
    onfulfilled?: ((value: any) => void | PromiseLike<void>) | null | undefined,
    onrejected?: ((reason: any) => PromiseLike<never>) | null | undefined
  ) {
    if (onfulfilled) {
      this.promiseCache = onfulfilled
      DomInterop.unRender(this)
      DomInterop.reRender(this)
      if (!this.props.cache) this.promiseCache = undefined
    } else if (onrejected) {
      console.error("handlePromise() - unhandle case 'onrejected'")
      debugger //todo
    } else {
      console.error("handlePromise() - unhandle case 'unknown'")
      debugger //todo
    }
  }

  setPromise(promise: { (): Promise<any> }) {
    if (!this.promise && promise) {
      this.promise = promise
      this.promise().then(this.handlePromise.bind(this))
    } else if (this.promise && !this.props.cache) {
      this.promise().then(this.handlePromise.bind(this))
    }
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
    if (children.some((c) => !(c instanceof RouteComponent)))
      throw new Error("Must provide Route as child of Router")
    // sort to make sure we match on more complex routes first
    this.children.sort((a, b) => {
      return (
        (b as RouteComponent).props.pathDepth -
        (a as RouteComponent).props.pathDepth
      )
    })
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

  matchRoute(
    c: RouteComponent,
    path: string
  ): {
    params: any
    routeMatch: RegExpMatchArray | null
  } {
    let paramNames: any[] = []
    const cPath: string = this.getParentPath() + c.props.path
    let regexPath =
      cPath.replace(/([:*])(\w+)/g, (_full, _colon, name) => {
        paramNames.push(name)
        return "([^/]+)"
      }) + "(?:/|$)"

    let params: any = {}
    let routeMatch = path.match(new RegExp(regexPath))
    if (routeMatch !== null) {
      params = routeMatch.slice(1).reduce((str, value, index) => {
        if (str === null) params = {}
        params[paramNames[index]] = value
        return params
      }, null)
    }
    return { params, routeMatch }
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
