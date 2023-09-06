import { Cinnabun } from "./cinnabun.js"
import { Component, FragmentComponent } from "./component.js"
import { ComponentChildren } from "./types.js"

const portalRoots: Record<string, Component> = {}

export const createPortal = (children: ComponentChildren, rootId: string) => {
  if (!Cinnabun.isClient) return new FragmentComponent()

  if (portalRoots[rootId]) {
    for (const c of children) {
      if (!c) continue
      portalRoots[rootId].appendChildren(c)
    }
    return portalRoots[rootId]
  }

  const element = document.getElementById(rootId)
  if (!element) throw new Error(`Element with id ${rootId} not found`)

  const res = Object.assign(new Component(element.tagName, { children }), {
    element,
    isStatic: true,
  })
  portalRoots[rootId] = res
  return res
}
