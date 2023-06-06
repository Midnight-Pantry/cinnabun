import { Component } from "./"
import { Signal } from "./"

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
  onUnmounted?: { (c: Component): void }
  onBeforeUnmounted?: { (c: Component): Promise<boolean> | undefined }
  onDestroyed?: { (c: Component): void }
}
export type ReactivityProps = {
  subscription?: ComponentSubscription
  watch?: Signal<any> | Signal<any>[]
}

export type ComponentProps = ReactivityProps &
  ComponentEventProps & {
    id?: string
    innerText?: string | number | Signal<string> | Signal<number>
    className?: string
    children?: ComponentChild[]
    visible?: boolean
    style?: Partial<CSSStyleDeclaration> | string
    key?: string | number
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
  children: (SerializedComponent | string)[]
  tag?: string
}

export type SSRProps = {
  component: SerializedComponent
  root: HTMLElement
}

export type ForChild = { (item: unknown, index?: number): Component }

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
