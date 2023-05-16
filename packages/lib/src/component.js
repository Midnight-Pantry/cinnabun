import { Cinnabun } from "./cinnabun.js"
import { DomInterop } from "./domInterop.js"
import { Signal } from "./signal.js"

export class Component {
  /**
   * @protected
   * @type {undefined | import("./types").ComponentSubscription<any>}
   */
  subscription = undefined

  /** @type {Component|null} */
  parent = null

  /** @type {import("./types").ComponentChild[]} */
  children = []

  /** @type {Component[]}  */
  funcComponents = []

  /** @type {HTMLElement | undefined} */
  element = undefined

  /**
   * Gets assigned as the first step in the serialization pipeline. Used for accessing component refs & request data.
   * @type {Cinnabun | undefined}
   */
  cbInstance = undefined

  /** @type {boolean} */
  mounted = false

  /**
   * @param {string} tag
   * @param {import("./types").ComponentProps} props
   */
  constructor(tag, props = {}) {
    this.tag = tag

    /** @private @type {import("./types").ComponentProps} */
    let _props = {
      render: true,
    }
    this.getProps = () => {
      return { ..._props }
    }

    /** @param {import("./types").ComponentProps} newProps */
    this.setProps = (newProps) => {
      const { children, watch, ...rest } = newProps
      Object.assign(_props, rest)

      if (children) {
        if (this.validateChildren(children)) this.replaceChildren(children)
      }
      if (Cinnabun.isClient && watch) {
        _props.watch = watch
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

    /** @param {import("./types").ComponentProps} newProps */
    this.setPropsQuietly = (newProps) => {
      _props = newProps
    }

    /**
     * @private
     * @param {keyof import("./types").ComponentProps} key
     * @param {*} val
     */
    this._setProp = (key, val) => {
      _props[key] = val
    }

    this.setProps(props)
  }

  /** @returns {*[]} */
  get childArgs() {
    return []
  }

  /**
   * @param {import("./types").ComponentChild[]} children
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
    const props = this.getProps()
    const bindFns = Object.entries(props).filter(([k]) => k.startsWith("bind:"))
    if (bindFns.length > 0) {
      for (const [k, v] of bindFns) {
        const propName = k.substring(k.indexOf(":") + 1)
        this._setProp(
          propName,
          this.getPrimitive(v, () => DomInterop.reRender(this))
        )

        const props = this.getProps()

        if (propName === "render" && Cinnabun.isClient) {
          if (!props.render || !this.parent?.getProps().render) {
            DomInterop.unRender(this)
          } else if (props.render) {
            DomInterop.reRender(this)
          }
        } else if (propName === "children") {
          if (props.children) this.replaceChildren(props.children)
          if (Cinnabun.isClient) DomInterop.renderChildren(this)
        } else if (this.element) {
          Object.assign(this.element, { [propName]: props[propName] })
        }
      }
    }
  }

  /**
   * @param {*} prop
   * @param {{ (val:*): void }} [signalCallback]
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

  /** @param {import("./types").ComponentSubscription<any>} subscription */
  subscribeTo(subscription) {
    if (this.subscription) return
    this.subscription = subscription

    const unsubscriber = this.subscription(this.setPropsQuietly, this)
    Cinnabun.addComponentReference({
      component: this,
      onDestroyed: () => unsubscriber(),
    })
  }

  /**
   * Binds events to the component.
   * @param {import("./types").ComponentEventProps} options - The event options.
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

  /** @param {import("./types").ComponentChild[]} newChildren */
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
    if (!this.getProps().render) return false
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
      subs.pop()?.onDestroyed()
    }
    Cinnabun.removeComponentReferences(el)
  }

  onDestroy() {
    const props = this.getProps()
    if (props.onDestroyed) props.onDestroyed(this)
  }

  /**
   * Get the parent component of a specific type.
   * @param {{(c:Component): boolean}} predicate - The predicate function to match the component.
   * @returns {Component | undefined} - The parent component of the specified type, or undefined if not found.
   */
  getParentOfType(predicate) {
    if (!this.parent) return undefined

    if (predicate(this.parent)) return this.parent

    return this.parent.getParentOfType(predicate)
  }

  /**
   * Check if the given data is an instance of a Component.
   * @param {*} data - The data to check.
   * @returns {data is Component} - True if the data is a Component instance, false otherwise.
   */
  static isComponent(data) {
    if (!(typeof data === "object")) return false
    return "children" in data && "addChild" in data
  }
}

export class FragmentComponent extends Component {
  /** @param {import("./types").ComponentChild[]} children */
  constructor(children = []) {
    super("", { children })
  }
}
