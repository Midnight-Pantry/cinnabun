import type { Component } from "./component.js"
import type { Signal } from "./signal.js"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: Partial<ComponentProps>
    }
  }
}

export type ServerRequestData = {
  path: string
  data: {
    [key: string]: any
  }
}

export type ServerPromise<T> = Promise<T>

export type ClassConstructor<InstanceType = any> = {
  new (...args: any[]): InstanceType
}
export type ClassInstance<Class> = InstanceType<ClassConstructor<Class>>

type Only<T, U> = {
  [P in keyof T]: T[P]
} & {
  [P in keyof U]?: never
}
export type Either<T, U> = Only<T, U> | Only<U, T>

export type Tag = string | ((props: any, children: any[]) => Component)
export type JSXProps = Record<string, string | number | null | undefined> | null
export type NodeChildren = (Node | string)[]

export type ComponentFunc = { (...args: any[]): Component }
export type ComponentChild =
  | Component
  | ComponentFunc
  | string
  | number
  | { (): string | number }

export type PropsSetter = { (props: ComponentProps): void }
export type ComponentSubscription<T extends Component> = {
  (fn: PropsSetter, self: T): { (): void }
}

export type SuspenseProps = {
  promise: { (): Promise<any> }
  cache?: boolean
  prefetch?: boolean
}
export type SuspenseChild =
  | ComponentChild
  | { (loading: boolean, data: any): ComponentChild }

export type WatchedElementRef = {
  component: Component
  onDestroyed: { (): void }
}

export type ComponentEventProps = {
  onMounted?: { (c: Component): void }
  onDestroyed?: { (c: Component): void }
}
export type ReactivityProps = {
  subscription?: ComponentSubscription<any>
  watch?: Signal<any> | Signal<any>[]
}

export type ComponentProps = ReactivityProps &
  ComponentEventProps & {
    id?: string
    innerText?: string | number | Signal<string> | Signal<number>
    className?: string
    children?: ComponentChild[]
    render?: boolean
    style?: Partial<CSSStyleDeclaration>
    [key: string]: any
  }

export type RouteProps = {
  path: string
  component: ComponentChild
}

export type LinkProps = ComponentProps & {
  store: Signal<string>
  to: string
  activeClass?: string
  useHash?: boolean
}

export type SerializedComponent = {
  props: {
    [key: string]: any
  }
  children: SerializedComponent[]
}

export type SSRProps = {
  component: SerializedComponent
  root: HTMLElement
}
