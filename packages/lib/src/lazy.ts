import { FragmentComponent } from "./component"
import { Hydration } from "./hydration"
import { SuspenseComponent } from "./suspense"
import { ComponentProps, LazyComponentModule } from "./types"

export const lazy = (
  modulePromise: LazyComponentModule,
  props?: Partial<ComponentProps>,
  prefetch: boolean = true
) => {
  const suspenseWrapper = new SuspenseComponent("", {
    promise: async () => modulePromise,
    prefetch,
    children: [
      (loading: boolean, res: { default?: any }) => {
        if (loading) return new FragmentComponent()
        if ("default" in res) return res.default(props)
        Hydration.lazyHydrate(suspenseWrapper, modulePromise, props)
      },
    ],
  })
  return suspenseWrapper
}
