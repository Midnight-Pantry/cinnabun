import { Cinnabun } from "./cinnabun.js"
import { DomInterop } from "./domInterop.js"
import { Signal } from "./signal.js"

/**
 * @typedef {import('./types.js').ComponentProps} ComponentProps
 * @typedef {import('./types.js').ComponentSubscription} ComponentSubscription
 * @typedef {import('./types.js').ComponentChild} ComponentChild
 * @typedef {import('./types.js').ComponentEventProps} ComponentEventProps
 * @typedef {import('./types.js').ClassConstructor} ClassConstructor
 */

export class Component {
  /** @private @type {ComponentProps} */
  _props = {}

  /** @private @type {ComponentSubscription | undefined} */
  subscription = undefined

  /** @type {Component|null} */
  parent = null

  /** @type {ComponentChild[]} */
  children = []

  /** @type {Component[]}  */
  funcComponents = []

  /** @type {HTMLElement | undefined} */
  element

  /** @type {Cinnabun | undefined} */
  cbInstance

  /** @type {boolean} */
  mounted = false

  /**
   * @param {string} tag
   * @param {ComponentProps} props
   */
  constructor(tag, props = {}) {
    this.tag = tag

    this.props = props
    if (typeof this._props.render === "undefined") this._props.render = true
  }
  get props() {
    return this._props
  }

  /** @param {ComponentProps} props */
  set props(props) {
    const { children, watch, ...rest } = props

    Object.assign(this._props, rest)
    if (children) {
      if (this.validateChildren(children)) this.replaceChildren(children)
    }

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

  /**
   * @returns {*[]}
   */
  get childArgs() {
    return []
  }

  /**
   * @param {ComponentChild[]} children
   * @returns {boolean}
   */
  validateChildren(children = []) {
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

  /**
   *
   * @param {*} prop
   * @param {{ (): void } | undefined} signalCallback
   * @returns {*}
   */
  getPrimitive(prop, signalCallback) {
    if (Signal.isSignal(prop)) {
      if (signalCallback)
        this.subscribeTo((_, __) => prop.subscribe(signalCallback.bind(this)))
      return prop.value
    }
    if (typeof prop === "function")
      return this.getPrimitive(prop(this), signalCallback)
    return prop
  }

  /** @param {ComponentSubscription} subscription */
  subscribeTo(subscription) {
    if (this.subscription) return
    this.subscription = subscription

    /** @param {ComponentProps} props */
    const setProps = (props) => {
      this.props = Object.assign(this.props, props)
    }
    const unsubscriber = this.subscription(setProps, this)
    Cinnabun.addComponentReference({
      component: this,
      onDestroyed: () => unsubscriber(),
    })
  }

  /**
   * Binds events to the component.
   * @param {ComponentEventProps} options - The event options.
   * @returns {void}
   */
  bindEvents({ onDestroyed }) {
    if (onDestroyed) {
      Cinnabun.addComponentReference({
        component: this,
        onDestroyed: () => onDestroyed(this),
      })
    }
  }

  /** @param {Component} child */
  addChild(child) {
    this.children.push(child)
    child.parent = this
    DomInterop.reRender(child)
  }

  /** @param {Component} child */
  prependChild(child) {
    this.children.unshift(child)
    child.parent = this
    DomInterop.reRender(child)
  }

  /** @param {ComponentChild[]} newChildren */
  replaceChildren(newChildren) {
    this.destroyChildComponentRefs(this)
    this.children = newChildren
    for (let i = 0; i < this.children.length; i++) {
      const c = this.children[i]
      if (Component.isComponent(c)) c.parent = this
    }
  }

  /** @param {Component} el */
  destroyChildComponentRefs(el) {
    for (const c of el.children) {
      if (typeof c === "string" || typeof c === "number") continue
      const val = typeof c === "function" ? c(...this.childArgs) : c
      if (Component.isComponent(val)) this.destroyComponentRefs(val)
    }
  }

  /** @returns {boolean} */
  shouldRender() {
    if (!this._props.render) return false
    if (this.parent) return this.parent?.shouldRender()
    return true
  }

  /** @param {Component} el */
  destroyComponentRefs(el) {
    this.destroyChildComponentRefs(el)
    el.parent = null
    const subs = Cinnabun.getComponentReferences(el).filter(
      (s) => s.component === el
    )
    while (subs.length) {
      subs.pop().onDestroyed()
    }
    Cinnabun.removeComponentReferences(el)
  }

  onDestroy() {
    if (this.props.onDestroyed) this.props.onDestroyed(this)
  }

  /**
   * Get the parent component of a specific type.
   * @template {ClassConstructor<Component>} Class - The class constructor of the component type.
   * @param {function(Component): boolean} predicate - The predicate function to match the component.
   * @returns {InstanceType<Class> | undefined} - The parent component of the specified type, or undefined if not found.
   */
  getParentOfType(predicate) {
    if (!this.parent) return undefined

    if (predicate(this.parent))
      return /** @type {InstanceType<Class>} */ (this.parent)

    return this.parent.getParentOfType(predicate)
  }

  /**
   * Check if the given data is an instance of a Component.
   * @param {*} data - The data to check.
   * @returns {boolean} - True if the data is a Component instance, false otherwise.
   */
  static isComponent(data) {
    if (!(typeof data === "object")) return false
    return "children" in data && "addChild" in data
  }
}

export class FragmentComponent extends Component {
  /** @param {ComponentChild[]} children */
  constructor(children = []) {
    super("", { children })
  }
}
