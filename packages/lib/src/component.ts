import { Cinnabun } from "./cinnabun"
import { DomInterop } from "./domInterop"

import { Signal } from "./signal"
import {
  ComponentSubscription,
  ComponentProps,
  ComponentChild,
  ClassConstructor,
  ComponentChildren,
} from "./types"

export class Component {
  parent: Component | null = null
  children: ComponentChild[] = []
  funcComponents: Component[] = []
  element: HTMLElement | SVGSVGElement | undefined
  cbInstance: Cinnabun | undefined
  isStatic: boolean = false

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
            DomInterop.unRender(this)
          }
        }
      } else if (propName === "children") {
        if (this._props.children) this.replaceChildren(this._props.children)
        if (Cinnabun.isClient) DomInterop.renderChildren(this)
      } else if (this.element) {
        Object.assign(this.element, { [propName]: this._props[propName] })
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

  removeChildren(...children: ComponentChildren) {
    for (const child of children) {
      const idx = this.children.indexOf(child)
      if (child instanceof Component) {
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
      if (child instanceof Component) {
        child.parent = this
        DomInterop.reRender(child)
      }
    }
  }

  appendChildren(...children: ComponentChildren) {
    this.children.push(...children)
    for (const child of children) {
      if (child instanceof Component) {
        child.parent = this
        DomInterop.reRender(child)
      }
    }
  }

  prependChildren(...children: ComponentChildren) {
    this.children.unshift(...children)
    for (const child of children) {
      if (child instanceof Component) {
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
      if (c instanceof Component) {
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

  recursiveCall(func: { (c: Component): void }) {
    func(this)
    for (const c of this.children) {
      if (c instanceof Component) c.recursiveCall(func)
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
}

export class FragmentComponent extends Component {
  constructor(children: ComponentChild[] = []) {
    super("", { children })
  }
}
