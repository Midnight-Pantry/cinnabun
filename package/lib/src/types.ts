import { Component } from "./component.js"
import { Signal } from "./signal.js"

export type ClassConstructor<InstanceType = any> = {
  new (...args: any[]): InstanceType
}

type Only<T, U> = {
  [P in keyof T]: T[P]
} & {
  [P in keyof U]?: never
}
export type Either<T, U> = Only<T, U> | Only<U, T>

export type Tag =
  | string
  | ((props: any, children: ComponentChildren) => Component)

export type JSXProps = Record<string, string | number | null | undefined> | null

export type LazyComponentModule = Promise<{
  default: { (...args: any[]): Component }
}>

export type ComponentFunc = { (...args: any[]): Component }
//Type '(loading: boolean, data: number) => Component<any>' is not assignable to type 'ComponentFunc'
export type ComponentChild =
  | Component
  | ComponentFunc
  | string
  | number
  | { (): string | number }
  | null

export type ComponentChildren = Array<ComponentChild>

export type PropsWithChildren = ComponentProps & {
  children?: ComponentChildren
}

export type PropsSetter = { (props: ComponentProps): void }
export type ComponentSubscription = {
  (fn: PropsSetter, self: Component): { (): void }
}

type SuspensePrefetchProps = Either<
  {
    /**
     * @description
     * If true, the promise will only be called during Server Side Rendering and will halt progress.
     */
    prefetch?: boolean
  },
  {
    /**
     * @description
     * If true, the promise will be called during Server Side Rendering but will not halt progress.
     */
    "prefetch:defer"?: boolean
  }
>

export type SuspenseProps = {
  /**
   * @description
   * A function that returns a promise.
   */
  promise: { (): Promise<any> }
  /**
   * @description
   * If true, the promise will only be called once.
   * If false, the promise will be called every time the component is rendered.
   */
  cache?: boolean
} & SuspensePrefetchProps

export type SuspenseChild =
  | ComponentChild
  | { (loading: boolean, data: any): ComponentChild }

export type WatchedElementRef = {
  component: Component
  onDestroyed: { (): void }
}

export type ComponentEventProps = {
  /**
   * @description
   * A function that will be called when the component is mounted to the DOM.
   * @example
   */
  onMounted?: { (self: Component): void }
  /**
   * @description
   * A function that will be called when the component is unmounted from the DOM.
   */
  onUnmounted?: { (self: Component): void }
  /**
   * @description
   * A function that will be called when the component is about to be unmounted from the DOM.
   * If the function returns a promise, the component will not be unmounted until the promise resolves.
   * If the promise resolves to false, the component will not be unmounted.
   */
  onBeforeUnmounted?: { (self: Component): Promise<boolean> | boolean }
  /**
   * @description
   * A function that will be called when the component is about to be rendered on the server.
   */
  onBeforeServerRendered?: { (self: Component): Promise<void> }
}
export type ReactivityProps = {
  /**
   * @description
   * A signal to bind to the Element produced by the component. Reverts to 'null' when the component is unmounted.
   * @example
   * ```tsx
   * import { useRef } from "cinnabun"
   *
   * const ref = useRef()
   * <p ref={ref} />
   * ```
   */
  ref?: Signal<null | Element>
  subscription?: ComponentSubscription
  /**
   * @description
   * A signal to watch for changes. When the signal changes,
   * 'bind:' props will be applied.
   * @example
   * ```tsx
   * <p watch={counter} bind:visible={() => counter.value > 5}>
   *   The value of counter is greater than 5
   * </p>
   * ```
   */
  watch?: Signal<any> | Signal<any>[]
  /**
   * @description
   * In combination with 'watch', this will cause the element to replace its children
   * with the provided value when the watched signal changes.
   * If no value is provided, the element will rerender its current children.
   * @example
   * ```tsx
   * <p watch={counter} bind:children>
   *  The value of counter is {counter.value}
   * </p>
   * ```
   */
  ["bind:children"]?: boolean | ((self: Component) => ComponentChildren)
  /**
   * @description
   * In combination with 'watch', this will cause the element to set its 'visible' property
   * to the provided value when the watched signal changes.
   * @example
   * ```tsx
   * <p watch={counter} bind:visible={() => counter.value > 5}>
   *  The value of counter is greater than 5
   * </p>
   * ```
   */
  ["bind:visible"]?: boolean | ((self: Component) => boolean)
}

export type ComponentProps = ReactivityProps &
  ComponentEventProps & {
    id?: string
    innerText?: string | number | Signal<string> | Signal<number>
    className?: string
    children?: ComponentChildren
    /**
     * @description
     * Determines if the component should be rendered.
     * @default true
     */
    visible?: boolean
    style?: Partial<CSSStyleDeclaration> | string
    /**
     * @description
     * A unique key to use for partial rerendering.
     * @example
     * ```tsx
     * import { For } from "cinnabun"
     * import { createSignal } from "cinnabun"
     *
     * const items = createSignal([{
     *   id: "f8befee4-716e-4efd-a48b-3e8d3731e19d",
     *   name: "foo"
     * }])
     * <For each={items} template={(item) => <div key={item.id}>{item.name}</div>} />
     * ```
     */
    key?: string | number
    [key: string]: any
  }

export type RouteProps = {
  /**
   * @description
   * The path to match against the current url.
   * @example
   * ```tsx
   * <Route path="/about" component={<AboutPage />} />
   * ```
   * @example
   * ```tsx
   * <Route path="/products/:id" component={(props) => <ProductPage id={props.params.id} />} />
   * ```
   */
  path: string
  /**
   * @description
   * The component to render when the path matches the current url.
   * @example
   * ```tsx
   * <Route path="/about" component={<AboutPage />} />
   * ```
   * @example
   * ```tsx
   * <Route path="/products/:id" component={(props) => <ProductPage id={props.params.id} />} />
   * ```
   */
  component: ComponentChild
}

export type LinkProps = ComponentProps & {
  store?: Signal<string>
  to: string
  activeClass?: string
  useHash?: boolean
  onBeforeNavigate?: { (): boolean }
}

export type SerializedComponent = {
  props: {
    [key: string]: any
  }
  children: (SerializedComponent | string)[]
  tag?: string
}

export type SSRProps = {
  component: SerializedComponent
  root: HTMLElement
}

export enum DiffType {
  NONE,
  CHANGED,
  ADDED,
  REMOVED,
}
// export enum DiffType {
//   NONE = "none",
//   CHANGED = "changed",
//   ADDED = "added",
//   REMOVED = "removed",
// }

export type DiffCheckResult = {
  key: string | number
  result: DiffType
  node?: Node
}

export type TemplateFunc<T> = { (item: T, index: number): Component }
export type ForProps<T> = {
  each: Signal<T[]> | T[]
  /**
   * @description
   * A function that returns a component for each item in the array.
   * The function will be called with the item and its index.
   * ##### *Ensure components have a unique key to enable partial rerendering!*
   *
   * @example
   * ```tsx
   * <For
   *  each={products}
   *  template={(p) => <ProductCard product={p} />}
   * />
   * ```
   */
  template?: TemplateFunc<T>
}
