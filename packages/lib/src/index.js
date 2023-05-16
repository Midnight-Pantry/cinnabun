import { Component } from "./component"
import { FragmentComponent } from "./component"

export * from "./cinnabun"
export * from "./component"
export * from "./domInterop"
export * from "./signal"
export * from "./suspense"

/**
 * @param {import("./types").Tag} tag
 * @param {import("./types").JSXProps} props
 * @param {import("./types").NodeChildren} children
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
