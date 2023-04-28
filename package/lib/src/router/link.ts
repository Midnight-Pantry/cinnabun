import { LinkProps } from "../types"
import { Component, Signal } from ".."
import { Cinnabun } from "../cinnabun"
import { matchPath } from "../router"

export const setHash = (store: Signal<string>, newHash: string) => {
  if (store.value === newHash) return
  window.location.hash = newHash
  store.value = newHash
}

export const setPath = (store: Signal<string>, newPath: string) => {
  if (window.location.pathname === newPath) return
  window.history.pushState({}, "", newPath)
  store.value = newPath
}

export const Link = (props: LinkProps, children: Component<any>[]) => {
  const { to, store, className, activeClass, useHash, ...rest } = props

  const onclick = (e: MouseEvent) => {
    e.preventDefault()
    if (useHash) return setHash(store, to)
    setPath(store, to)
  }

  return new Component("a", {
    watch: store,
    ["bind:className"]: (self: Component<HTMLAnchorElement>) => {
      const curPath = Cinnabun.isClient
        ? store.value
        : self.cbInstance?.serverRequest.path

      const pathMatches = !!matchPath(curPath ?? "/", to).routeMatch

      return (
        className ?? "" + " " + (pathMatches ? activeClass ?? "active" : "")
      )
    },
    href: to,
    onclick,
    children,
    ...rest,
  })
}
