import { LinkProps } from "../types"
import { Component, Signal } from ".."
import { Cinnabun } from "../cinnabun"

export const setHash = (store: Signal<string>, newHash: string) => {
  if (store.value === newHash) return
  if (!Cinnabun.isClient) {
    Cinnabun.setHash(newHash)
  } else {
    window.location.hash = newHash
  }
  store.value = newHash
}

export const setPath = (store: Signal<string>, newPath: string) => {
  if (window.location.pathname === newPath) return
  if (!Cinnabun.isClient) {
    Cinnabun.setPath(newPath)
  } else {
    window.history.pushState({}, "", newPath)
  }
  store.value = newPath
}

export const Link = (props: LinkProps, children: Component<any>[]) => {
  const { to, store, useHash, ...rest } = props

  const handleClick = (e: Event) => {
    e.preventDefault()
    if (useHash) return setHash(store, to)
    setPath(store, to)
  }

  return new Component("a", {
    watch: store,
    ["bind:className"]: () => (store.value === to ? "active" : ""),
    href: to,
    onClick: handleClick,
    children,
    ...rest,
  })
}
