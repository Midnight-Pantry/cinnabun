export { Component } from "./component"
export { Signal, createSignal } from "./signal"
export { Suspense } from "./suspense"

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
      [key: string]: Partial<ComponentProps<any>>
    }
  }
}

export const h = (tag: Tag, props: JSXProps, ...children: NodeChildren) => {
  if (typeof tag === "function") {
    return tag({ ...props }, children)
  }

  let p = props ? props : ({} as ComponentProps<any>)

  //@ts-ignore
  p.children = [...children]

  return new Component<HTMLElement>(tag, p)
}

export function fragment(_: any, children: ComponentChild[]) {
  return new FragmentComponent(children)
}
