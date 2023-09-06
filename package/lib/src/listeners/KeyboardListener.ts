import { Component } from "../"
import { ComponentChild, ComponentChildren } from "../types"

type KeyboardListenerProps = {
  keys: string[]
  onCapture: (keys: string[], e: Event) => void
  requireAll?: boolean
}

export const KeyboardListener = (
  props: KeyboardListenerProps,
  children: ComponentChildren
) => {
  const { keys, requireAll, onCapture } = props
  let currentKeys: string[] = []
  let self: Component | undefined

  const triggerCallback = (e: KeyboardEvent) => {
    if (!self || self.children.length === 0) {
      onCapture(currentKeys, e)
      currentKeys = []
      return
    }
    // check if event originated from a child
    // if so, don't trigger callback
    for (const c of self.children) {
      if (componentIsTarget(c, e)) {
        onCapture(currentKeys, e)
        currentKeys = []
        return
      }
    }
    for (const fc of self.funcComponents) {
      if (componentIsTarget(fc, e)) {
        onCapture(currentKeys, e)
        currentKeys = []
        return
      }
    }
  }

  function componentIsTarget(c: ComponentChild, e: Event) {
    if (Component.isComponent(c)) {
      if (e.target === c.element) return true
      const childIsTarget = c.children.some((child) =>
        componentIsTarget(child, e)
      )
      if (childIsTarget) return true
      const fChildIsTarget = c.funcComponents.some((child) =>
        componentIsTarget(child, e)
      )
      if (fChildIsTarget) return true
    }

    return false
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const { key } = e
    if (keys.includes(key)) {
      currentKeys.push(key)
      if (!requireAll) {
        return triggerCallback(e)
      }
      if (currentKeys.length === keys.length) triggerCallback(e)
    }
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    const { key } = e
    if (keys.includes(key)) {
      currentKeys.splice(currentKeys.indexOf(key), 1)
    }
  }

  return new Component("", {
    children,
    onMounted(c: Component) {
      self = c
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
    },
    onUnmounted() {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    },
  })
}
