export { Component } from "./component"
export { Signal, createSignal, computed } from "./signal"
export { Suspense } from "./suspense"
export { lazy } from "./lazy"
export { For } from "./for"
export { createPortal } from "./portal"

import { Component } from "."
import { FragmentComponent } from "./component"
import { ComponentChildren, ComponentProps, JSXProps, Tag } from "./types"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: Partial<ComponentProps>
    }
  }
}

export const h = (
  tag: Tag,
  props: JSXProps,
  ...children: ComponentChildren
) => {
  if (typeof tag === "function") {
    return tag({ ...props, children }, children)
  }

  let p = props ? props : ({} as ComponentProps)

  p.children = children

  return new Component(tag, p)
}

export function fragment(_: any, children: ComponentChildren) {
  return new FragmentComponent(children)
}
