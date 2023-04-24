import { SuspenseProps } from "./types"
import { Component, SuspenseComponent } from "./component"

export const Suspense = (
  { prefetch, promise, cache }: SuspenseProps,
  children: [Component<any>]
) => {
  return new SuspenseComponent("", { prefetch, promise, cache, children })
}
