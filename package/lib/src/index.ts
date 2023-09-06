export { Component, For, Suspense, RawHtml } from "./component.js"
export {
  Signal,
  createSignal,
  computed,
  useComputed,
  useSignal,
} from "./signal.js"
export { createPortal } from "./portal.js"
export { useRef } from "./ref.js"

import { FragmentComponent, Component } from "./component.js"
import { ComponentChildren, ComponentProps, JSXProps, Tag } from "./types.js"

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
