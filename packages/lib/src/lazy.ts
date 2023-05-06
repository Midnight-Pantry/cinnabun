import { FragmentComponent } from "./component"
import { SuspenseComponent } from "./suspense"

export const lazy = (func: Promise<{ default: any }>) => {
  return new SuspenseComponent("", {
    promise: async () => func,
    children: [
      (loading: boolean, res: { default: any }) => {
        if (loading) return new FragmentComponent()
        return res.default()
      },
    ],
  })
}
