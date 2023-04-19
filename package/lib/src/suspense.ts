import { SuspenseProps } from "./types"
import { Component, SuspenseComponent } from "./component"

export const Suspense = (
  { promise, cache }: SuspenseProps,
  children: [Component<any>]
) => {
  return new SuspenseComponent("", { promise, cache, children })
}
