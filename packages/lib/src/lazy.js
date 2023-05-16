import { Component, FragmentComponent } from "./component.js"
import { SuspenseComponent } from "./suspense.js"

/**
 * Creates a lazy-loaded component.
 * @param {Promise.<{ default: any }>} func - The promise that resolves to the lazy-loaded component.
 * @param {Partial.<import("./types.js").ComponentProps>} props - The partial props for the lazy-loaded component.
 * @param {boolean} [prefetch=true] - Whether to prefetch the lazy-loaded component.
 * @returns {SuspenseComponent} - The suspense component.
 */
export const lazy = (func, props, prefetch = true) => {
  return new SuspenseComponent("", {
    promise: async () => func,
    prefetch,
    children: [
      /**
       * @param {boolean} loading - Indicates whether the component is loading.
       * @param {{ default: any }} res - The resolved lazy-loaded component.
       * @returns {Component} - The rendered component.
       */
      (loading, res) => {
        if (loading) return new FragmentComponent()
        return res.default(props)
      },
    ],
  })
}
