import { Signal } from "../signal.js"
import { Component } from "../component.js"
import { Cinnabun } from "../cinnabun.js"
import { matchPath } from "./index.js"

/**
 * @typedef {import('../types.js').LinkProps} LinkProps
 */

/**
 * @param {Signal<string>} store
 * @param {string} newHash
 */
export const setHash = (store, newHash) => {
  if (store.value === newHash) return
  window.location.hash = newHash
  store.value = newHash
}

/**
 * @param {Signal<string>} store
 * @param {string} newPath
 */
export const setPath = (store, newPath) => {
  if (window.location.pathname === newPath) return
  window.history.pushState({}, "", newPath)
  store.value = newPath
}

/**
 *
 * @param {LinkProps} props
 * @param {Component[]} children
 * @returns {Component}
 */
export const Link = (props, children) => {
  const { to, store, className, activeClass, useHash, ...rest } = props

  /** @param {MouseEvent} e  */
  const onclick = (e) => {
    e.preventDefault()
    if (useHash) return setHash(store, to)
    setPath(store, to)
  }

  return new Component("a", {
    watch: store,
    /** @param {Component} self */
    ["bind:className"]: (self) => {
      const curPath = Cinnabun.isClient
        ? store.value
        : Cinnabun.getInstanceRef(self).getServerRequestData("path")

      const pathMatches = !!matchPath(curPath ?? "/", to).routeMatch

      return `${className ?? ""} ${pathMatches ? activeClass ?? "active" : ""}`
    },
    href: to,
    onclick,
    children,
    ...rest,
  })
}
