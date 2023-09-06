import { LinkProps } from "../types.js"
import { Component, Signal } from "../index.js"
import { Cinnabun } from "../cinnabun.js"
import { RouterComponent } from "./router.js"
import { matchPath } from "./index.js"

export const setHash = (store: Signal<string>, newHash: string) => {
  if (store.value === newHash) return
  window.location.hash = newHash
  store.value = newHash
}

export const setPath = (
  store: Signal<string>,
  newPath: string,
  replace: boolean = false
) => {
  if (window.location.pathname === newPath) return
  if (replace) {
    window.history.replaceState({}, "", newPath)
  } else {
    window.history.pushState({}, "", newPath)
  }
  store.value = newPath
}

export const Link = (props: LinkProps, children: Component[]) => {
  const {
    to,
    store = RouterComponent.pathStore,
    className,
    activeClass,
    useHash,
    onBeforeNavigate,
    ...rest
  } = props

  const onclick = (e: MouseEvent) => {
    e.preventDefault()
    if (onBeforeNavigate && !onBeforeNavigate()) return
    if (useHash) return setHash(store, to)
    setPath(store, to)
  }

  return new Component("a", {
    watch: store,
    ["bind:className"]: (self: Component) => {
      const curPath = Cinnabun.isClient
        ? store.value
        : self.cbInstance?.getServerRequestData<string>("path")

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
