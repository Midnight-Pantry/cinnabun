import { Cinnabun } from "./cinnabun"
import { DomInterop } from "./domInterop"

import { Signal } from "./signal"
import {
  ComponentSubscription,
  ComponentProps,
  ComponentChild,
  ComponentEventProps,
  ClassConstructor,
  GenericComponent,
} from "./types"

export class Component<T extends HTMLElement> {
  parent: Component<any> | null = null
  children: ComponentChild[] = []
  funcComponents: GenericComponent[] = []
  element: T | undefined
  cbInstance: Cinnabun | undefined

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

    if (Cinnabun.isClient && watch) {
      console.log("dafooooooq")
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
          DomInterop.reRender(this)
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
      return this.getPrimitive(prop(this), signalCallback)
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

  bindEvents({ onDestroyed }: ComponentEventProps<T>) {
    if (onDestroyed) {
      Cinnabun.addComponentReference({
        component: this,
        onDestroyed: () => onDestroyed(this),
      })
    }
  }

  addChild(child: Component<any>) {
    this.children.push(child)
    child.parent = this
    DomInterop.reRender(child)
  }

  prependChild(child: Component<any>) {
    this.children.unshift(child)
    child.parent = this
    DomInterop.reRender(child)
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
      if (val instanceof Component) this.destroyComponentRefs(val)
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

  getParentOfType<Class extends ClassConstructor<Component<any>>>(
    classRef: Class
  ): InstanceType<Class> | undefined {
    if (!this.parent) return undefined

    if (this.parent instanceof classRef)
      return this.parent as InstanceType<Class>

    //@ts-ignore (screw typescript, this is correct)
    return this.parent.getParentOfType(classRef)
  }
}

export class FragmentComponent extends Component<any> {
  constructor(children: ComponentChild[]) {
    super("", { children })
  }
}
