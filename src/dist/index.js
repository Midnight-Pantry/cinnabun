"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // src/cinnabon.ts
  var _Cinnabon = class {
    static render(component) {
      if (typeof component === "function") {
        const val = component();
        if (typeof val === "string" || typeof val === "number")
          return val;
        return _Cinnabon.render(val);
      }
      return component.render();
    }
    static getInputType(val) {
      switch (typeof val) {
        case "boolean":
          return "checkbox";
        case "number":
          return "number";
        case "string":
        case void 0:
          return "text";
      }
      throw new Error(
        "unable to get input type for val with type: " + typeof val + " - " + val
      );
    }
    static element(tag, props = {}) {
      return new Component(tag, props);
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
        el.append(
          typeof c === "string" ? c : _Cinnabon.svg(typeof c === "function" ? c() : c)
        );
      }
      return el;
    }
  };
  var Cinnabon2 = _Cinnabon;
  __publicField(Cinnabon2, "DEBUG_COMPONENT_REFCOUNT", false);
  var componentReferences = [];
  var setComponentReferences = (func) => {
    componentReferences = func(componentReferences);
    if (Cinnabon2.DEBUG_COMPONENT_REFCOUNT)
      console.debug(
        "onDestroyCallbacks",
        componentReferences.length,
        performance.now()
      );
  };
  var addComponentReference = (ref) => {
    componentReferences.push(ref);
    if (Cinnabon2.DEBUG_COMPONENT_REFCOUNT)
      console.debug(
        "onDestroyCallbacks",
        componentReferences.length,
        performance.now()
      );
  };

  // src/signal.ts
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
      for (const subscribeFunc of this._subscribers) {
        subscribeFunc(newVal);
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
    logSubscriberCount() {
      if (LOG_NUM_SUBS)
        console.debug(this._name + " subscribers:", this._subscribers.size);
    }
  };
  function createSignal(initialValue) {
    return new Signal(initialValue);
  }

  // src/component.ts
  var Component = class {
    constructor(tag, props = {}) {
      this.tag = tag;
      this.props = props;
      if (typeof this._props.render === "undefined")
        this._props.render = true;
    }
    parent = null;
    children = [];
    funcElements = [];
    element;
    promise;
    promiseCache;
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
      if (watch && watch instanceof Signal) {
        const unsub = watch.subscribe(this.applyBindProps.bind(this));
        addComponentReference({
          component: this,
          onDestroyed: () => unsub()
        });
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
    handlePromise(onfulfilled, onrejected) {
      if (onfulfilled) {
        console.log("promise fulfilled");
        this.promiseCache = onfulfilled;
        this.unRender();
        this.reRender();
        if (!this._props.cache)
          this.promiseCache = void 0;
      } else if (onrejected) {
        console.error("handlePromise() - unhandle case 'onrejected'");
        debugger;
      } else {
        console.error("handlePromise() - unhandle case 'unknown'");
        debugger;
      }
    }
    shouldRender() {
      if (!this._props.render)
        return false;
      if (this.parent)
        return this.parent?.shouldRender();
      return true;
    }
    reRender() {
      if (!this.shouldRender())
        return;
      const { element, idx } = this.getMountLocation();
      let thisEl = this.element ?? this.render(true);
      if (element) {
        const c = element.children[idx];
        if (c) {
          element.insertBefore(thisEl, c);
        } else {
          element.append(thisEl);
        }
      }
    }
    applyBindProps() {
      const bindFns = Object.entries(this.props).filter(
        ([k]) => k.startsWith("bind:")
      );
      if (bindFns.length > 0) {
        for (const [k, v] of bindFns) {
          const propName = k.substring(k.indexOf(":") + 1);
          this._props[propName] = this.getPrimitive(v, this.renderChildren);
          if (propName === "render") {
            if (!this._props.render || !this.parent?._props.render) {
              this.unRender();
            } else if (this._props.render) {
              this.reRender();
            }
          } else if (propName === "children") {
            if (this._props.children)
              this.replaceChildren(this._props.children);
            this.renderChildren();
          } else if (this.element) {
            Object.assign(this.element, { [propName]: this._props[propName] });
          }
        }
      }
    }
    getPrimitive(prop, signalCallback) {
      if (prop instanceof Signal) {
        this.subscribeTo((_, __) => prop.subscribe(signalCallback.bind(this)));
        return prop.value;
      }
      if (typeof prop === "function")
        return this.getPrimitive(prop(), signalCallback);
      return prop;
    }
    render(isRender = false) {
      const {
        children,
        onMounted,
        onChange,
        onClick,
        onDestroyed,
        subscription,
        promise
      } = this.props;
      setComponentReferences((arr) => arr.filter((c) => c.component !== this));
      if (!this.tag) {
        const f = document.createDocumentFragment();
        if (subscription)
          this.subscribeTo(subscription);
        f.append(...this.getRenderableChildren().map((c) => this.renderChild(c)));
        this.mounted = true;
        if (!isRender && this instanceof SuspenseComponent) {
          if (!this.promise && promise) {
            this.promise = promise;
            this.promise().then(this.handlePromise.bind(this));
          } else if (this.promise && !this._props.cache) {
            this.promise().then(this.handlePromise.bind(this));
          }
        }
        return f;
      }
      if (this.tag === "svg")
        return Cinnabon2.svg(this);
      this.element = document.createElement(this.tag);
      if (children)
        this.replaceChildren(children);
      this.renderChildren();
      this.updateElement();
      this.bindEvents({
        onChange,
        onClick,
        onDestroyed,
        onMounted
      });
      if (subscription)
        this.subscribeTo(subscription);
      this.mounted = true;
      return this.element;
    }
    bindEvents({
      onChange,
      onClick,
      onDestroyed,
      onMounted
    }) {
      if (this.element) {
        if (onChange) {
          this.element.addEventListener("change", onChange);
          addComponentReference({
            component: this,
            onDestroyed: () => this.element.removeEventListener("change", onChange)
          });
        }
        if (onClick) {
          const fn = (e) => onClick(e, this);
          this.element.addEventListener("click", fn);
          addComponentReference({
            component: this,
            onDestroyed: () => this.element.removeEventListener("click", fn)
          });
        }
      }
      if (onDestroyed) {
        addComponentReference({
          component: this,
          onDestroyed: () => onDestroyed(this)
        });
      }
      if (!this.mounted && onMounted)
        onMounted(this);
    }
    updateElement() {
      if (!this.element)
        return;
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
      } = this.props;
      if (style)
        Object.assign(this.element.style, style);
      if (htmlFor && "htmlFor" in this.element)
        this.element.htmlFor = htmlFor;
      if (Object.keys(rest).length) {
        for (const [k, v] of Object.entries(rest)) {
          Object.assign(this.element, {
            [k]: this.getPrimitive(v, this.updateElement)
          });
        }
      }
    }
    getRenderableChildren() {
      return this.children.filter(
        (c) => typeof c === "function" || typeof c === "string" || c instanceof Component && c._props.render || c instanceof Signal
      );
    }
    unRender() {
      if (this.funcElements.length > 0) {
        for (const fc of this.funcElements) {
          fc.remove();
        }
        this.funcElements = [];
      }
      if (this.element)
        return this.element.remove();
      for (const c of this.children) {
        if (c instanceof Component) {
          c.unRender();
        } else if (c instanceof Node) {
          c.parentNode?.removeChild(c);
        }
      }
    }
    renderChildren() {
      if (!this.props.render)
        return;
      if (!this.element)
        return;
      const children = this.getRenderableChildren().map(
        this.renderChild.bind(this)
      );
      this.element.replaceChildren(...children);
    }
    renderChild(child) {
      if (child instanceof Signal) {
        this.subscribeTo(
          (_, __) => child.subscribe(this.renderChildren.bind(this))
        );
        return child.value.toString();
      }
      if (child instanceof Component)
        return child.render();
      if (typeof child === "function") {
        const res = this.renderChild(child(...this.childArgs));
        this.funcElements = Array.isArray(res) ? res : [res];
        return res;
      }
      return child;
    }
    subscribeTo(subscription) {
      if (this.subscription)
        return;
      this.subscription = subscription;
      const setProps = (props) => {
        this.props = Object.assign(this.props, props);
      };
      const unsubscriber = this.subscription(setProps, this);
      addComponentReference({
        component: this,
        onDestroyed: () => unsubscriber()
      });
    }
    getMountLocation(start = 0) {
      if (!this.parent)
        return { element: null, idx: -1 };
      for (let i = 0; i < this.parent.children.length; i++) {
        const c = this.parent.children[i];
        if (c instanceof Component && !c._props.render)
          continue;
        if (c === this)
          break;
        start++;
      }
      if (this.parent.element)
        return { element: this.parent.element, idx: start };
      return this.parent.getMountLocation(start);
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
        if (typeof c === "string")
          continue;
        const val = typeof c === "function" ? c(...this.childArgs) : c;
        if (typeof val !== "string")
          this.destroyComponentRefs(val);
      }
    }
    destroyComponentRefs(el) {
      this.destroyChildComponentRefs(el);
      el.parent = null;
      const subs = componentReferences.filter((s) => s.component === el);
      while (subs.length) {
        subs.pop().onDestroyed();
      }
      setComponentReferences((arr) => arr.filter((s) => s.component !== el));
    }
    onDestroy() {
      if (this.props.onDestroyed)
        this.props.onDestroyed(this);
    }
  };
  var SuspenseComponent = class extends Component {
    get childArgs() {
      return [!this.promiseCache, this.promiseCache];
    }
    resetPromise() {
      this.promise = void 0;
      this.promiseCache = void 0;
    }
  };
  var FragmentComponent = class extends Component {
    constructor(children) {
      super("", { children });
    }
  };

  // src/suspense.ts
  var Suspense = ({ promise, cache }, children) => {
    return new SuspenseComponent("", { promise, cache, children });
  };

  // src/Logo.tsx
  var Logo = () => /* @__PURE__ */ Cinnabon.h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      "xmlns:xlink": "http://www.w3.org/1999/xlink",
      width: "300",
      zoomAndPan: "magnify",
      viewBox: "0 0 375 374.999991",
      height: "300",
      preserveAspectRatio: "xMidYMid meet",
      version: "1.0"
    },
    /* @__PURE__ */ Cinnabon.h("defs", null, /* @__PURE__ */ Cinnabon.h("g", null), /* @__PURE__ */ Cinnabon.h("clipPath", { id: "2f510bc3ab" }, /* @__PURE__ */ Cinnabon.h(
      "path",
      {
        d: "M 263.316406 145.25 L 304.566406 145.25 L 304.566406 161 L 263.316406 161 Z M 263.316406 145.25 ",
        "clip-rule": "nonzero"
      }
    ))),
    /* @__PURE__ */ Cinnabon.h("g", { fill: "#fff", "fill-opacity": "1" }, /* @__PURE__ */ Cinnabon.h("g", { transform: "translate(73.374712, 206.624986)" }, /* @__PURE__ */ Cinnabon.h("g", null, /* @__PURE__ */ Cinnabon.h("path", { d: "M 4.21875 -57.96875 L 24.9375 -57.96875 C 30.519531 -57.96875 35.066406 -56.476562 38.578125 -53.5 C 42.085938 -50.53125 43.84375 -46.28125 43.84375 -40.75 C 43.84375 -36.488281 42.773438 -32.914062 40.640625 -30.03125 C 38.515625 -27.15625 35.625 -25.128906 31.96875 -23.953125 L 51.921875 0 L 35.125 0 L 17.421875 -22.90625 L 17.421875 0 L 4.21875 0 Z M 17.421875 -32.25 L 18.96875 -32.25 C 20.1875 -32.25 21.21875 -32.269531 22.0625 -32.3125 C 22.90625 -32.363281 23.863281 -32.53125 24.9375 -32.8125 C 26.019531 -33.09375 26.890625 -33.488281 27.546875 -34 C 28.203125 -34.519531 28.765625 -35.269531 29.234375 -36.25 C 29.703125 -37.238281 29.9375 -38.4375 29.9375 -39.84375 C 29.9375 -41.25 29.703125 -42.441406 29.234375 -43.421875 C 28.765625 -44.410156 28.203125 -45.160156 27.546875 -45.671875 C 26.890625 -46.191406 26.019531 -46.585938 24.9375 -46.859375 C 23.863281 -47.140625 22.90625 -47.300781 22.0625 -47.34375 C 21.21875 -47.394531 20.1875 -47.421875 18.96875 -47.421875 L 17.421875 -47.421875 Z M 17.421875 -32.25 " })))),
    /* @__PURE__ */ Cinnabon.h("g", { fill: "#fff", "fill-opacity": "1" }, /* @__PURE__ */ Cinnabon.h("g", { transform: "translate(123.684916, 206.624986)" }, /* @__PURE__ */ Cinnabon.h("g", null, /* @__PURE__ */ Cinnabon.h("path", { d: "M 40.6875 -16.296875 L 14.546875 -16.296875 C 14.546875 -13.765625 15.363281 -11.890625 17 -10.671875 C 18.644531 -9.460938 20.425781 -8.859375 22.34375 -8.859375 C 24.351562 -8.859375 25.941406 -9.125 27.109375 -9.65625 C 28.285156 -10.195312 29.625 -11.265625 31.125 -12.859375 L 40.125 -8.359375 C 36.375 -2.085938 30.144531 1.046875 21.4375 1.046875 C 16 1.046875 11.332031 -0.8125 7.4375 -4.53125 C 3.550781 -8.257812 1.609375 -12.742188 1.609375 -17.984375 C 1.609375 -23.234375 3.550781 -27.726562 7.4375 -31.46875 C 11.332031 -35.21875 16 -37.09375 21.4375 -37.09375 C 27.144531 -37.09375 31.789062 -35.441406 35.375 -32.140625 C 38.957031 -28.835938 40.75 -24.117188 40.75 -17.984375 C 40.75 -17.140625 40.726562 -16.578125 40.6875 -16.296875 Z M 14.890625 -23.1875 L 28.59375 -23.1875 C 28.3125 -25.0625 27.570312 -26.5 26.375 -27.5 C 25.1875 -28.507812 23.65625 -29.015625 21.78125 -29.015625 C 19.71875 -29.015625 18.078125 -28.472656 16.859375 -27.390625 C 15.640625 -26.316406 14.984375 -24.914062 14.890625 -23.1875 Z M 14.890625 -23.1875 " })))),
    /* @__PURE__ */ Cinnabon.h("g", { fill: "#fff", "fill-opacity": "1" }, /* @__PURE__ */ Cinnabon.h("g", { transform: "translate(166.055095, 206.624986)" }, /* @__PURE__ */ Cinnabon.h("g", null, /* @__PURE__ */ Cinnabon.h("path", { d: "M 4.21875 0 L 4.21875 -36.046875 L 16.65625 -36.046875 L 16.65625 -32.25 L 16.796875 -32.25 C 20.023438 -35.476562 23.46875 -37.09375 27.125 -37.09375 C 28.90625 -37.09375 30.671875 -36.859375 32.421875 -36.390625 C 34.179688 -35.921875 35.867188 -35.195312 37.484375 -34.21875 C 39.097656 -33.238281 40.410156 -31.84375 41.421875 -30.03125 C 42.429688 -28.226562 42.9375 -26.132812 42.9375 -23.75 L 42.9375 0 L 30.5 0 L 30.5 -20.375 C 30.5 -22.25 29.898438 -23.890625 28.703125 -25.296875 C 27.503906 -26.703125 25.945312 -27.40625 24.03125 -27.40625 C 22.15625 -27.40625 20.457031 -26.675781 18.9375 -25.21875 C 17.414062 -23.769531 16.65625 -22.15625 16.65625 -20.375 L 16.65625 0 Z M 4.21875 0 " })))),
    /* @__PURE__ */ Cinnabon.h("g", { fill: "#fff", "fill-opacity": "1" }, /* @__PURE__ */ Cinnabon.h("g", { transform: "translate(212.500687, 206.624986)" }, /* @__PURE__ */ Cinnabon.h("g", null, /* @__PURE__ */ Cinnabon.h("path", { d: "M 6.671875 -4.46875 C 3.296875 -8.144531 1.609375 -12.648438 1.609375 -17.984375 C 1.609375 -23.328125 3.296875 -27.847656 6.671875 -31.546875 C 10.046875 -35.242188 14.332031 -37.09375 19.53125 -37.09375 C 24.3125 -37.09375 28.25 -35.597656 31.34375 -32.609375 L 31.34375 -60.421875 L 43.78125 -60.421875 L 43.78125 0 L 31.484375 0 L 31.484375 -4.078125 L 31.34375 -4.078125 C 28.25 -0.660156 24.3125 1.046875 19.53125 1.046875 C 14.332031 1.046875 10.046875 -0.789062 6.671875 -4.46875 Z M 17.25 -24.09375 C 15.632812 -22.507812 14.828125 -20.472656 14.828125 -17.984375 C 14.828125 -15.503906 15.597656 -13.476562 17.140625 -11.90625 C 18.691406 -10.34375 20.734375 -9.5625 23.265625 -9.5625 C 25.691406 -9.5625 27.691406 -10.351562 29.265625 -11.9375 C 30.835938 -13.53125 31.625 -15.546875 31.625 -17.984375 C 31.625 -20.472656 30.8125 -22.507812 29.1875 -24.09375 C 27.570312 -25.6875 25.597656 -26.484375 23.265625 -26.484375 C 20.867188 -26.484375 18.863281 -25.6875 17.25 -24.09375 Z M 17.25 -24.09375 " })))),
    /* @__PURE__ */ Cinnabon.h("g", { fill: "#fff", "fill-opacity": "1" }, /* @__PURE__ */ Cinnabon.h("g", { transform: "translate(260.492124, 206.624986)" }, /* @__PURE__ */ Cinnabon.h("g", null, /* @__PURE__ */ Cinnabon.h("path", { d: "M 4.21875 0 L 4.21875 -36.046875 L 16.65625 -36.046875 L 16.65625 -30.84375 L 16.796875 -30.84375 C 16.890625 -31.03125 17.039062 -31.265625 17.25 -31.546875 C 17.457031 -31.828125 17.910156 -32.316406 18.609375 -33.015625 C 19.316406 -33.722656 20.066406 -34.359375 20.859375 -34.921875 C 21.660156 -35.484375 22.691406 -35.984375 23.953125 -36.421875 C 25.222656 -36.867188 26.515625 -37.09375 27.828125 -37.09375 C 29.179688 -37.09375 30.515625 -36.90625 31.828125 -36.53125 C 33.140625 -36.15625 34.101562 -35.78125 34.71875 -35.40625 L 35.6875 -34.859375 L 30.5 -24.3125 C 28.945312 -25.625 26.789062 -26.28125 24.03125 -26.28125 C 22.53125 -26.28125 21.238281 -25.953125 20.15625 -25.296875 C 19.082031 -24.640625 18.320312 -23.84375 17.875 -22.90625 C 17.4375 -21.96875 17.125 -21.171875 16.9375 -20.515625 C 16.75 -19.859375 16.65625 -19.34375 16.65625 -18.96875 L 16.65625 0 Z M 4.21875 0 " })))),
    /* @__PURE__ */ Cinnabon.h("g", { "clip-path": "url(#2f510bc3ab)" }, /* @__PURE__ */ Cinnabon.h(
      "path",
      {
        fill: "#9c1bf6",
        d: "M 262.953125 145.261719 L 289.320312 145.261719 C 297.960938 145.261719 304.953125 152.296875 304.953125 160.988281 L 262.953125 160.988281 Z M 262.953125 145.261719 ",
        "fill-opacity": "1",
        "fill-rule": "nonzero"
      }
    ))
  );

  // src/index.ts
  var h = (tag, props, ...children) => {
    if (typeof tag === "function") {
      return tag({ ...props }, children);
    }
    let p = props ? props : {};
    p.children = [...children];
    return new Component(tag, p);
  };
  function fragment(_, children) {
    return new FragmentComponent(children);
  }
})();
//# sourceMappingURL=index.js.map
