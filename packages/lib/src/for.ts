import { Component } from "./component"
import { DomInterop } from "./domInterop"
import { Signal } from "./signal"
import { ForChild, ComponentSubscription } from "./types"

class ForComponent extends Component {
  constructor(items: Signal<any[]> | any[], forChild: [ForChild]) {
    if (!forChild[0] || typeof forChild[0] !== "function")
      throw new Error(
        "<For/> must have child matching { (item: T, index?: number): Cinnabun.Component }"
      )

    const mapPredicate = forChild[0]
    let subscription: ComponentSubscription | undefined = undefined

    const reactiveItems = items instanceof Signal ? items : new Signal(items)

    subscription = (_, self) =>
      reactiveItems.subscribe((newItems) => {
        DomInterop.diffMergeChildren(self, newItems.map(mapPredicate))
      })

    super("", { subscription })
  }
}

export const For = (
  { each }: { each: Signal<any[]> | any[] },
  children: [ForChild]
) => {
  return new ForComponent(each, children)
}
