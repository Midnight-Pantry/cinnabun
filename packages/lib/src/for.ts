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
          const keys = newChildren.map((c) => c.props.key)
          const allKeysAreUnique = keys.every((k, i) => keys.indexOf(k) === i)
          if (!allKeysAreUnique) {
            console.error(
              "Children of <For/> must have unique keys, and they should not be index-based - expect bugs!"
            )
          }
          const hardReRender = () => {
            DomInterop.unRender(self)
            self.replaceChildren(newChildren)
            DomInterop.reRender(self)
          }

          if (!allKeysAreUnique || !Cinnabun.isClient) {
            if (Cinnabun.isClient) {
              hardReRender()
            } else {
              self.replaceChildren(newChildren)
            }
          } else {
            //if (!allKeysAreUnique) return hardReRender()
            DomInterop.diffMergeChildren(self, newChildren)
          }
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
