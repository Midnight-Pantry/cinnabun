export { Cinnabun } from "./cinnabun.js"
export { Component } from "./component.js"
export { Signal, createSignal } from "./signal.js"
export { Suspense } from "./suspense.js"
export { lazy } from "./lazy.js"
export * from "./router"

import { Component } from "./component.js"
import { FragmentComponent } from "./component.js"
/**
 * @namespace JSX
 */

/**
 * @typedef {Object} IntrinsicElements
 * @property {Object} [key]
 * @property {Partial.<import('./types').ComponentProps>} [key]
 */

/**
 * @global
 * @namespace JSX
 * @property {IntrinsicElements} IntrinsicElements
 */

/**
 * @param {import('./types').Tag} tag
 * @param {import('./types').JSXProps} props
 * @param {import('./types').NodeChildren} children
 * @returns {Component}
 */
export const h = (tag, props, ...children) => {
  if (typeof tag === "function") {
    return tag({ ...props }, children)
  }

  let p = props ? props : {}

  p.children = [...children]

  return new Component(tag, p)
}

/**
 *
 * @param {*} _ - unused
 * @param {import('./types').ComponentChild[]} children
 * @returns {FragmentComponent}
 */
export function fragment(_, children) {
  return new FragmentComponent(children)
}
