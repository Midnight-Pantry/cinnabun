export { Component, For, Suspense } from "./component"
export {
  Signal,
  createSignal,
  computed,
  useComputed,
  useSignal,
} from "./signal"
export { createPortal } from "./portal"
export { useRef } from "./ref"

import { FragmentComponent, Component } from "./component"
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
