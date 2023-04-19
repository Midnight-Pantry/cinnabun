import { Signal, Component } from ".."
import { RouteComponent, RouterComponent } from "../component"
import { PropsSetter } from "../types"

interface RouterProps {
  store: Signal<string>
}

export const Router = ({ store }: RouterProps, children: RouteComponent[]) => {
  const subscription = (_: PropsSetter, self: Component<any>) => {
    return store.subscribe((val) => {
      // sort to make sure we match on more complex routes first
      self.children.sort((a, b) => {
        return (
          (b as RouteComponent).props.pathDepth -
          (a as RouteComponent).props.pathDepth
        )
      })
      let len = self.children.length
      while (len--) {
        ;(self.children[len] as Component<any>).props.render = false
      }
      self.unRender()

      for (let i = 0; i < self.children.length; i++) {
        const c = self.children[i] as RouteComponent
        const matchRes = (self as RouterComponent).matchRoute(c, val)
        if (matchRes.routeMatch) {
          c.props.render = !!matchRes.routeMatch
          c.props.params = matchRes.params
          break
        }
      }
      if (self.mounted) self.reRender()
    })
  }
  return new RouterComponent(subscription, children)
}
