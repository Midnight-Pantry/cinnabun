import { FragmentComponent } from "./component"
import { SuspenseComponent } from "./suspense"
import { ComponentProps } from "./types"

export const lazy = (
  func: Promise<{ default: any }>,
  props: Partial<ComponentProps>,
  prefetch: boolean = true
) => {
  return new SuspenseComponent("", {
    promise: async () => func,
    prefetch,
    children: [
      (loading: boolean, res: { default: any }) => {
        if (loading) return new FragmentComponent()
        return res.default(props)
      },
    ],
  })
}
