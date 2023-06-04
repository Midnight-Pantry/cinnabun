import { Cinnabun } from "./cinnabun"
import { Component } from "./component"
import { ComponentChildren } from "./types"

export const createPortal = (children: ComponentChildren, rootId: string) => {
  if (!Cinnabun.isClient) return ""

  const element = document.getElementById(rootId)
  if (!element) throw new Error(`Element with id ${rootId} not found`)

  return Object.assign(new Component(element.tagName, { children }), {
    element,
    isStatic: true,
  })
}
