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
              "Children of <For/> must have a unique key to enable partial rerendering"
            )
          }
          // this is the classic approach where the entire list is rerendered.
          // instead we want to do a diff and only rerender the changed items -
          // but only if all children have a unique key and we're on the client
          // // DomInterop.unRender(self)
          // // self.replaceChildren(newChildren)
          // // DomInterop.reRender(self)

          if (!Cinnabun.isClient || !allKeysAreUnique) {
            self.replaceChildren(newChildren)
          } else {
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
