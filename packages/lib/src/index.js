import { Component } from "./component.js"
import { FragmentComponent } from "./component.js"

export { Cinnabun } from "./cinnabun.js"
export { Component } from "./component.js"
export { Signal, createSignal } from "./signal.js"
export { Suspense } from "./suspense.js"
export { lazy } from "./lazy.js"
export * from "./router/index.js"

/**
 * @param {import("./types.js").Tag} tag
 * @param {import("./types.js").JSXProps} props
 * @param {import("./types.js").NodeChildren} children
 * @returns {Component}
 */
export const h = (tag, props, ...children) => {
  if (typeof tag === "function") {
    return tag({ ...props }, children)
  }

  let p = props ? props : {}

  // @ts-ignore
  p.children = [...children]

  return new Component(tag, p)
}

/**
 *
 * @param {*} _ - unused
 * @param {import("./types.js").ComponentChild[]} children
 * @returns {FragmentComponent}
 */
export function fragment(_, children) {
  return new FragmentComponent(children)
}
