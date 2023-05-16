import { Component, FragmentComponent } from "./component.js"

export * from "./cinnabun.js"
export { Component, FragmentComponent } from "./component.js"
export * from "./domInterop.js"
export * from "./signal.js"
export * from "./suspense.js"

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
