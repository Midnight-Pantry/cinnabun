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

export class Component {
  parent: Component | null = null
  children: ComponentChild[] = []
  funcComponents: Component[] = []
  element: HTMLElement | SVGSVGElement | undefined
  cbInstance: Cinnabun | undefined

  private _mounted: boolean = false
  get mounted() {
    return this._mounted
  }
  set mounted(val: boolean) {
    const changed = this._mounted !== val
    this._mounted = val
    if (changed && val && this._props.onMounted) {
      setTimeout(() => this._props.onMounted!(this), 0)
    } else if (changed && !val && this._props.onUnmounted) {
      this._props.onUnmounted(this)
    }
  }

  private subscription: ComponentSubscription | undefined
  private _props: ComponentProps = {}
  constructor(public tag: string, props: ComponentProps = {}) {
    this.props = props
    if (typeof this._props.render === "undefined") this._props.render = true
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
  }

  get childArgs(): any[] {
    return []
  }

  applyBindProps() {
    const bindFns = Object.entries(this.props).filter(([k]) =>
      k.startsWith("bind:")
    )
    if (bindFns.length > 0) {
      for (const [k, v] of bindFns) {
        const propName = k.substring(k.indexOf(":") + 1)

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

    const setProps = (props: ComponentProps) => {
      this.props = Object.assign(this.props, props)
    }
    const unsubscriber = this.subscription(setProps, this)
    Cinnabun.addComponentReference({
      component: this,
      onDestroyed: () => unsubscriber(),
    })
  }

  bindEvents({ onDestroyed }: ComponentEventProps) {
    if (onDestroyed) {
      Cinnabun.addComponentReference({
        component: this,
        onDestroyed: () => onDestroyed(this),
      })
    }
  }

  removeChild(child: ComponentChild) {
    const idx = this.children.indexOf(child)
    if (child instanceof Component) {
      this.destroyComponentRefs(child)
      child.parent = null
      DomInterop.unRender(child)
    }
    this.children[idx] = null
  }

  insertChild(child: Component, index: number) {
    this.children.splice(index, 0, child)
    child.parent = this
    DomInterop.reRender(child)
  }

  addChild(child: Component) {
    this.children.push(child)
    child.parent = this
    DomInterop.reRender(child)
  }

  prependChild(child: Component) {
    this.children.unshift(child)
    child.parent = this
    DomInterop.reRender(child)
  }

  replaceChild(child: Component, newChild: Component) {
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
      if (c instanceof Component) {
        c.parent = this
        c.linkChildren()
      }
    }
  }

  destroyChildComponentRefs(el: Component) {
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

  getParentOfType<Class extends ClassConstructor<Component>>(
    classRef: Class
  ): InstanceType<Class> | undefined {
    if (!this.parent) return undefined

    if (this.parent instanceof classRef)
      return this.parent as InstanceType<Class>

    //@ts-ignore (screw typescript, this is correct)
    return this.parent.getParentOfType(classRef)
  }

  unMount() {
    for (const c of this.children) {
      if (c instanceof Component) c.unMount()
    }
    this.mounted = false
  }

  isSVG(): boolean {
    try {
      return this.tag.toLowerCase() === "svg" || !!this.element?.closest("svg")
    } catch (error) {
      console.error("isSVG ERROR", this.element)
      return false
    }
  }
}

export class FragmentComponent extends Component {
  constructor(children: ComponentChild[] = []) {
    super("", { children })
  }
}
