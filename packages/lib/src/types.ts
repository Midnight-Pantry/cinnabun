import { Component } from "./component.js"
import { Signal } from "./signal.js"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: Partial<ComponentProps<any>>
    }
  }
}

export type ServerPromise<T> = Promise<T>

export type ClassConstructor<InstanceType = any> = {
  new (...args: any[]): InstanceType
}

type Only<T, U> = {
  [P in keyof T]: T[P]
} & {
  [P in keyof U]?: never
}
export type Either<T, U> = Only<T, U> | Only<U, T>

export type Tag = string | ((props: any, children: any[]) => Component)
export type JSXProps = Record<string, string | number | null | undefined> | null
export type NodeChildren = (Node | string)[]

export type GenericComponent = Component
export type ComponentFunc = { (...args: any[]): GenericComponent }
//Type '(loading: boolean, data: number) => Component<any>' is not assignable to type 'ComponentFunc'
export type ComponentChild =
  | GenericComponent
  | ComponentFunc
  | string
  | number
  | { (): string | number }

export type PropsSetter = { (props: ComponentProps<any>): void }
export type ComponentSubscription = {
  (fn: PropsSetter, self: Component): { (): void }
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
  component: GenericComponent
  onDestroyed: { (): void }
}

export type ComponentEventProps<T extends HTMLElement> = {
  onMounted?: { (c: Component): void }
  onDestroyed?: { (c: Component): void }
}
export type ReactivityProps = {
  subscription?: ComponentSubscription
  watch?: Signal<any> | Signal<any>[]
}

export type ComponentProps<T extends HTMLElement> = ReactivityProps &
  ComponentEventProps<T> & {
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

export type LinkProps = ComponentProps<HTMLAnchorElement> & {
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
