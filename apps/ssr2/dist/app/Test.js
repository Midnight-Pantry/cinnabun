var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// app/Test.jsx
var Test_exports = {};
__export(Test_exports, {
  MyTestComponent: () => MyTestComponent
});
module.exports = __toCommonJS(Test_exports);

// ../../packages/lib/src/domInterop.ts
var DomInterop = class {
  static updateElement(component) {
    if (!component.element)
      return;
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
    } = component.props;
    if (style)
      Object.assign(component.element.style, style);
    if (htmlFor && "htmlFor" in component.element)
      component.element.htmlFor = htmlFor;
    if (Object.keys(rest).length) {
      for (const [k, v] of Object.entries(rest)) {
        if (k.includes("bind:"))
          continue;
        if (k.startsWith("on")) {
          Object.assign(component.element, { [k]: v });
          continue;
        }
        Object.assign(component.element, {
          [k]: component.getPrimitive(
            v,
            () => DomInterop.updateElement(component)
          )
        });
      }
    }
  }
  static getRenderedChildren(component) {
    return DomInterop.getRenderableChildren(component).map(
      (c) => DomInterop.renderChild(component, c)
    );
  }
  static getRenderableChildren(component) {
    return component.children.filter(
      (c) => typeof c === "function" || typeof c === "string" || typeof c === "number" || c instanceof Component && c.props.render || c instanceof Signal
    );
  }
  static renderChildren(component) {
    if (!component.props.render)
      return;
    if (!component.element)
      return;
    DomInterop.removeFuncComponents(component);
    component.element.replaceChildren(
      ...DomInterop.getRenderedChildren(component)
    );
  }
  static renderChild(component, child) {
    if (child instanceof Signal) {
      component.subscribeTo(
        (_, __) => child.subscribe(() => DomInterop.renderChildren(component))
      );
      return child.value.toString();
    }
    if (child instanceof Component)
      return DomInterop.render(child);
    if (typeof child === "function") {
      const c = child(...component.childArgs);
      const res = DomInterop.renderChild(component, c);
      if (c instanceof Component)
        component.funcComponents.push(c);
      return res;
    }
    return child.toString();
  }
  static removeFuncComponents(component) {
    if (component.funcComponents.length > 0) {
      for (const fc of component.funcComponents) {
        DomInterop.unRender(fc);
        Cinnabun.removeComponentReferences(fc);
      }
      component.funcComponents = [];
    }
  }
  static unRender(component) {
    try {
      DomInterop.removeFuncComponents(component);
      if (component.element) {
        return component.element.remove();
      }
      for (const c of component.children) {
        if (c instanceof Component) {
          DomInterop.unRender(c);
        } else if (c instanceof Node) {
          c.parentNode?.removeChild(c);
        }
      }
    } catch (error) {
      console.error("failed to unrender", component, error);
      debugger;
    }
  }
  static reRender(component) {
    if (!component.shouldRender())
      return;
    const el = component.element ?? DomInterop.render(component, true);
    if (component.element)
      DomInterop.renderChildren(component);
    if (el.isConnected)
      return;
    const { element, idx } = DomInterop.getMountLocation(component);
    if (!element) {
      console.error("Failed to get component mount element", component, el);
      return;
    }
    const prevChild = element.children[idx - 1];
    if (prevChild) {
      element.insertBefore(el, prevChild);
    } else {
      element.appendChild(el);
    }
  }
  static render(component, isRerender = false) {
    const { children, onMounted, onDestroyed, subscription, promise } = component.props;
    Cinnabun.removeComponentReferences(component);
    if (!component.tag) {
      const f = document.createDocumentFragment();
      if (subscription)
        component.subscribeTo(subscription);
      f.append(...DomInterop.getRenderedChildren(component));
      component.mounted = true;
      if (!isRerender && "setPromise" in component && typeof component.setPromise === "function") {
        component.setPromise(promise);
      }
      return f;
    }
    if (component.tag === "svg")
      return DomInterop.svg(component);
    if (!component.element) {
      component.element = document.createElement(component.tag);
    }
    if (children)
      component.replaceChildren(children);
    DomInterop.renderChildren(component);
    DomInterop.updateElement(component);
    component.bindEvents({ onDestroyed });
    if (subscription)
      component.subscribeTo(subscription);
    component.mounted = true;
    if (onMounted)
      onMounted(component);
    return component.element;
  }
  static svg(component) {
    const el = document.createElementNS(
      "http://www.w3.org/2000/svg",
      component.tag
    );
    const { render, ...props } = component.props;
    for (const [k, v] of Object.entries(props)) {
      el.setAttribute(k, v);
    }
    for (const c of component.children) {
      if (typeof c === "string" || typeof c === "number") {
        el.append(c.toString());
      } else {
        if (typeof c === "function") {
          const val = c();
          if (typeof val === "string" || typeof val === "number") {
            el.append(val.toString());
          } else {
            el.append(DomInterop.svg(val));
          }
        } else {
          el.append(DomInterop.svg(c));
        }
      }
    }
    return el;
  }
  static getMountLocation(component, start = 0) {
    if (!component.parent)
      return { element: null, idx: -1 };
    for (let i = 0; i < component.parent.children.length; i++) {
      const c = component.parent.children[i];
      if (c instanceof Component && !c.props.render)
        continue;
      if (c === component) {
        start++;
        break;
      }
      if (c instanceof Component) {
        if (c.element)
          start++;
      }
    }
    if (component.parent.element)
      return { element: component.parent.element, idx: start };
    return DomInterop.getMountLocation(component.parent, start);
  }
};

// ../../packages/lib/src/cinnabun.ts
var _Cinnabun = class {
  //ssr instance
  serverComponentReferences = [];
  serverRequest = {
    path: "/",
    data: {}
  };
  setServerRequestData(data) {
    this.serverRequest = data;
  }
  getServerRequestData(keysPath) {
    const props = keysPath.split(".");
    let value = { ...this.serverRequest };
    for (let i = 0; i < props.length; i++) {
      value = value[props[i]];
      if (value === void 0) {
        return void 0;
      }
    }
    return value;
  }
  static bake(app, root) {
    const tray = new Component(root.tagName, {
      children: [app]
    });
    tray.element = root;
    DomInterop.render(tray);
  }
  static getComponentReferences(component) {
    return _Cinnabun.isClient ? _Cinnabun.componentReferences : component.cbInstance.serverComponentReferences;
  }
  static removeComponentReferences(component) {
    _Cinnabun.removeComponentChildReferences(component);
    if (_Cinnabun.isClient) {
      _Cinnabun.componentReferences = _Cinnabun.componentReferences.filter(
        (c) => c.component !== component
      );
    } else {
      component.cbInstance.serverComponentReferences = component.cbInstance.serverComponentReferences.filter(
        (c) => c.component !== component
      );
    }
  }
  static removeComponentChildReferences(component) {
    for (const c of component.children) {
      if (c instanceof Component)
        _Cinnabun.removeComponentReferences(c);
    }
  }
  static logComponentRefCount(component) {
    console.debug(
      "~~ CB REF COUNT",
      _Cinnabun.isClient ? _Cinnabun.componentReferences.length : component.cbInstance.serverComponentReferences.length,
      performance.now()
    );
  }
  static registerRuntimeServices(...services) {
    _Cinnabun.runtimeServices.push(...services);
  }
  static getRuntimeService(classRef) {
    return _Cinnabun.runtimeServices.find((s) => {
      return s instanceof classRef;
    });
  }
};
var Cinnabun = _Cinnabun;
__publicField(Cinnabun, "DEBUG_COMPONENT_REFCOUNT", false);
__publicField(Cinnabun, "isClient", "window" in globalThis);
//client singleton
__publicField(Cinnabun, "rootMap", /* @__PURE__ */ new Map());
__publicField(Cinnabun, "componentReferences", []);
__publicField(Cinnabun, "runtimeServices", []);
__publicField(Cinnabun, "addComponentReference", (ref) => {
  if (_Cinnabun.isClient) {
    _Cinnabun.componentReferences.push(ref);
  } else {
    ref.component.cbInstance.serverComponentReferences.push(ref);
  }
  if (_Cinnabun.DEBUG_COMPONENT_REFCOUNT)
    _Cinnabun.logComponentRefCount(ref.component);
});

// ../../packages/lib/src/signal.ts
var computeFunc = null;
var LOG_NUM_SUBS = false;
var Signal = class {
  _val;
  _subscribers = /* @__PURE__ */ new Set();
  _name;
  constructor(value, name) {
    this._val = value;
    this._name = name;
  }
  get value() {
    if (computeFunc) {
      this._subscribers.add(computeFunc);
      this.logSubscriberCount();
    }
    return this._val;
  }
  set value(newVal) {
    this._val = newVal;
    this.notify();
  }
  notify() {
    for (const subscribeFunc of this._subscribers) {
      subscribeFunc(this._val);
    }
  }
  subscribe(func) {
    this._subscribers.add(func);
    this.logSubscriberCount();
    func(this._val);
    return () => this.unsubscribe(func);
  }
  unsubscribe(func) {
    this._subscribers.delete(func);
    this.logSubscriberCount();
  }
  serialize() {
    return JSON.stringify(this.value);
  }
  logSubscriberCount() {
    if (LOG_NUM_SUBS)
      console.debug(this._name + " subscribers:", this._subscribers.size);
  }
};

// ../../packages/lib/src/component.ts
var Component = class {
  constructor(tag, props = {}) {
    this.tag = tag;
    this.props = props;
    if (typeof this._props.render === "undefined")
      this._props.render = true;
  }
  parent = null;
  children = [];
  funcComponents = [];
  element;
  cbInstance;
  mounted = false;
  subscription;
  _props = {};
  get props() {
    return this._props;
  }
  set props(props) {
    const { children, watch, ...rest } = props;
    Object.assign(this._props, rest);
    if (children) {
      if (this.validateChildren(children))
        this.replaceChildren(children);
    }
    if (Cinnabun.isClient && watch) {
      this._props.watch = watch;
      const signals = "length" in watch ? watch : [watch];
      for (const s of signals) {
        const unsub = s.subscribe(this.applyBindProps.bind(this));
        Cinnabun.addComponentReference({
          component: this,
          onDestroyed: () => unsub()
        });
      }
    }
  }
  get childArgs() {
    return [];
  }
  validateChildren(children = []) {
    if (children.some((c) => Array.isArray(c))) {
      console.error("Error: Cannot render child of type Array", children);
      return false;
    }
    return true;
  }
  applyBindProps() {
    const bindFns = Object.entries(this.props).filter(
      ([k]) => k.startsWith("bind:")
    );
    if (bindFns.length > 0) {
      for (const [k, v] of bindFns) {
        const propName = k.substring(k.indexOf(":") + 1);
        this._props[propName] = this.getPrimitive(
          v,
          () => DomInterop.reRender(this)
        );
        if (propName === "render" && Cinnabun.isClient) {
          if (!this._props.render || !this.parent?._props.render) {
            DomInterop.unRender(this);
          } else if (this._props.render) {
            DomInterop.reRender(this);
          }
        } else if (propName === "children") {
          if (this._props.children)
            this.replaceChildren(this._props.children);
          if (Cinnabun.isClient)
            DomInterop.renderChildren(this);
        } else if (this.element) {
          Object.assign(this.element, { [propName]: this._props[propName] });
        }
      }
    }
  }
  getPrimitive(prop, signalCallback) {
    if (prop instanceof Signal) {
      if (signalCallback)
        this.subscribeTo((_, __) => prop.subscribe(signalCallback.bind(this)));
      return prop.value;
    }
    if (typeof prop === "function")
      return this.getPrimitive(prop(this), signalCallback);
    return prop;
  }
  subscribeTo(subscription) {
    if (this.subscription)
      return;
    this.subscription = subscription;
    const setProps = (props) => {
      this.props = Object.assign(this.props, props);
    };
    const unsubscriber = this.subscription(setProps, this);
    Cinnabun.addComponentReference({
      component: this,
      onDestroyed: () => unsubscriber()
    });
  }
  bindEvents({ onDestroyed }) {
    if (onDestroyed) {
      Cinnabun.addComponentReference({
        component: this,
        onDestroyed: () => onDestroyed(this)
      });
    }
  }
  addChild(child) {
    this.children.push(child);
    child.parent = this;
    DomInterop.reRender(child);
  }
  prependChild(child) {
    this.children.unshift(child);
    child.parent = this;
    DomInterop.reRender(child);
  }
  replaceChildren(newChildren) {
    this.destroyChildComponentRefs(this);
    this.children = newChildren;
    for (let i = 0; i < this.children.length; i++) {
      const c = this.children[i];
      if (c instanceof Component)
        c.parent = this;
    }
  }
  destroyChildComponentRefs(el) {
    for (const c of el.children) {
      if (typeof c === "string" || typeof c === "number")
        continue;
      const val = typeof c === "function" ? c(...this.childArgs) : c;
      if (val instanceof Component)
        this.destroyComponentRefs(val);
    }
  }
  shouldRender() {
    if (!this._props.render)
      return false;
    if (this.parent)
      return this.parent?.shouldRender();
    return true;
  }
  destroyComponentRefs(el) {
    this.destroyChildComponentRefs(el);
    el.parent = null;
    const subs = Cinnabun.getComponentReferences(el).filter(
      (s) => s.component === el
    );
    while (subs.length) {
      subs.pop().onDestroyed();
    }
    Cinnabun.removeComponentReferences(el);
  }
  onDestroy() {
    if (this.props.onDestroyed)
      this.props.onDestroyed(this);
  }
  getParentOfType(classRef) {
    if (!this.parent)
      return void 0;
    if (this.parent instanceof classRef)
      return this.parent;
    return this.parent.getParentOfType(classRef);
  }
};

// ../../packages/lib/src/index.ts
var h = (tag, props, ...children) => {
  if (typeof tag === "function") {
    return tag({ ...props }, children);
  }
  let p = props ? props : {};
  p.children = [...children];
  return new Component(tag, p);
};

// app/Test.jsx
var MyTestComponent = () => {
  return /* @__PURE__ */ h("h1", null, "MyTestComponent");
};
