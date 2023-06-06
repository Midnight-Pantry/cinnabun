import { Cinnabun } from "./cinnabun"
import { Component } from "./component"
import { DomInterop } from "./domInterop"
import { Signal } from "./signal"

type TemplateFunc<T> = { (item: T, index: number): Component }
type ForProps<T> = {
  each: Signal<T[]> | T[]
  /**
   * @description
   * A function that returns a component for each item in the array.
   * The function will be called with the item and its index.
   * ##### *Ensure components have a unique key to enable partial rerendering!*
   *
   * @example
   * ```tsx
   * <For
   *  each={products}
   *  template={(p) => <ProductCard product={p} />}
   * />
   * ```
   */
  template?: TemplateFunc<T>
}

export class ForComponent<T> extends Component {
  constructor(items: Signal<T[]> | T[], mapPredicate: TemplateFunc<T>) {
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

/**
 * @description
 * A component that renders a list of items
 * @example
 * ```tsx
 * <For
 *   each={products}
 *   template={(p) => <ProductCard product={p} />}
 * />
 * ```
 */
export function For<T>(
  { each, template }: ForProps<T>,
  templateChild: [TemplateFunc<T>]
): Component {
  return new ForComponent<T>(each, template ?? templateChild[0])
}
