import { FragmentComponent, SuspenseComponent } from "./component"
import { Hydration } from "./hydration"
import { ComponentProps, LazyComponentModule } from "./types"

export const lazy = (
  modulePromise: LazyComponentModule,
  props?: Partial<ComponentProps>,
  prefetch: boolean = true
) => {
  const suspenseWrapper = new SuspenseComponent(
    {
      promise: async () => modulePromise,
      prefetch,
      cache: true,
    },
    [
      (loading: boolean, res: { default?: any }) => {
        if (loading) return new FragmentComponent()
        if ("default" in res) {
          const component = res.default(props)
          component.parent = suspenseWrapper
          return component
        }
        Hydration.lazyHydrate(suspenseWrapper, modulePromise, props)
      },
    ]
  )
  return suspenseWrapper
}
