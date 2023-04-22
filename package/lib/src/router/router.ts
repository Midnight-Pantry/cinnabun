import { Signal, Component } from ".."
import { Cinnabun } from "../cinnabun"
import { RouteComponent, RouterComponent } from "../component"
import { PropsSetter } from "../types"

interface RouterProps {
  store: Signal<string>
}

export const Router = ({ store }: RouterProps, children: RouteComponent[]) => {
  const subscription = (_: PropsSetter, self: Component<any>) => {
    return store.subscribe((val) => {
      let len = self.children.length
      while (len--) {
        ;(self.children[len] as RouteComponent).props.render = false
      }
      if (Cinnabun.isClient) self.unRender()

      for (let i = 0; i < self.children.length; i++) {
        const c = self.children[i] as RouteComponent
        const matchRes = (self as RouterComponent).matchRoute(
          c,
          Cinnabun.isClient ? val : Cinnabun.serverRequestPath
        )
        if (matchRes.routeMatch) {
          c.props.render = !!matchRes.routeMatch
          c.props.params = matchRes.params
          break
        }
      }
      if (Cinnabun.isClient && self.mounted) self.reRender()
    })
  }
  return new RouterComponent(subscription, children)
}
