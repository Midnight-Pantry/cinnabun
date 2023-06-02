import { Cinnabun } from "./cinnabun"
import { Component } from "./component"
import { DomInterop } from "./domInterop"
import { Signal } from "./signal"
import { ForChild } from "./types"

export class ForComponent extends Component {
  constructor(items: Signal<any[]> | any[], forChild: [ForChild]) {
    if (!forChild[0] || typeof forChild[0] !== "function")
      throw new Error(
        "<For/> must have child matching { (item: T, index?: number): Cinnabun.Component }"
      )

    const mapPredicate = forChild[0]
    const reactiveItems = items instanceof Signal ? items : new Signal(items)

    super("", {
      subscription: (_, self) =>
        reactiveItems.subscribe((newItems) => {
          const newChildren = newItems.map(mapPredicate)
          // check if all children have a key and the key is unique
          // if not, we can't do partial rerendering
          let uniqueKeys = true
          for (const child of newChildren) {
            //prettier-ignore
            if (newChildren.filter((c) => c.props.key === child.props.key).length > 1) {
              uniqueKeys = false
              console.error("non-unique key found in <For/>", child.props.key)
              console.error(
                "Children of <For/> must have unique keys, and they should not be index-based - expect bugs!"
              )
              break
            }
          }
          // ssr doesn't need to worry about partial rerendering, so we can just replace the children
          if (!Cinnabun.isClient) return self.replaceChildren(newChildren)
          // if we have unique keys, we can do partial rerendering
          if (uniqueKeys && !self.props.hydrating)
            return DomInterop.diffMergeChildren(self, newChildren)
          // otherwise, we have to do a full rerender
          DomInterop.unRender(self)
          self.replaceChildren(newChildren)
          DomInterop.reRender(self)
        }),
    })
  }
}

export const For = (
  { each }: { each: Signal<any[]> | any[] },
  children: [ForChild]
) => {
  return new ForComponent(each, children)
}
