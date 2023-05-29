export { Component } from "./component"
export { Signal, createSignal } from "./signal"
export { Suspense } from "./suspense"
export { lazy } from "./lazy"
export { For } from "./for"

import { Component } from "."
import { FragmentComponent } from "./component"
import {
  ComponentChild,
  ComponentProps,
  JSXProps,
  NodeChildren,
  Tag,
} from "./types"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: Partial<ComponentProps>
    }
  }
}

export const h = (tag: Tag, props: JSXProps, ...children: NodeChildren) => {
  if (typeof tag === "function") {
    return tag({ ...props, children }, children)
  }

  let p = props ? props : ({} as ComponentProps)

  //@ts-ignore
  p.children = children

  return new Component(tag, p)
}

export function fragment(_: any, children: ComponentChild[]) {
  return new FragmentComponent(children)
}
