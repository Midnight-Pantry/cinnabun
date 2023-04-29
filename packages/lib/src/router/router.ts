import { matchPath } from "."
import { Signal, Component } from ".."
import { Cinnabun } from "../cinnabun"
import { DomInterop } from "../domInterop"
import { ComponentSubscription, PropsSetter } from "../types"
import { RouteComponent } from "./route"

interface RouterProps {
  store: Signal<string>
}

export class RouterComponent extends Component<any> {
  constructor(subscription: ComponentSubscription, children: RouteComponent[]) {
    if (children.some((c) => !(c instanceof RouteComponent)))
      throw new Error("Must provide Route as child of Router")

    children.sort((a, b) => {
      return (
        (b as RouteComponent).props.pathDepth -
        (a as RouteComponent).props.pathDepth
      )
    })
    super("", { subscription, children })
  }

  getParentPath() {
    let parentPath = ""
    let parentRoute = this.getParentOfType(RouteComponent)

    while (parentRoute) {
      parentPath = parentRoute.props.path + parentPath
      parentRoute = parentRoute.getParentOfType(RouteComponent)
    }
    return parentPath
  }

  matchRoute(
    c: RouteComponent,
    path: string
  ): {
    params: any
    routeMatch: RegExpMatchArray | null
  } {
    const cPath: string = this.getParentPath() + c.props.path

    return matchPath(path, cPath)
  }
}

export const Router = ({ store }: RouterProps, children: RouteComponent[]) => {
  const subscription = (_: PropsSetter, self: Component<any>) => {
    return store.subscribe((val) => {
      let len = self.children.length
      while (len--) {
        const rc = self.children[len] as RouteComponent
        rc.props.render = false
        rc.props.params = {}
      }
      if (Cinnabun.isClient) DomInterop.unRender(self)

      for (let i = 0; i < self.children.length; i++) {
        const c = self.children[i] as RouteComponent
        const matchRes = (self as RouterComponent).matchRoute(
          c,
          Cinnabun.isClient
            ? val
            : self.cbInstance!.getServerRequestData<string>("path")!
        )
        if (matchRes.routeMatch) {
          c.props.render = !!matchRes.routeMatch
          c.props.params = matchRes.params ?? {}
          break
        }
      }
      if (Cinnabun.isClient && self.mounted) DomInterop.reRender(self)
    })
  }
  return new RouterComponent(subscription, children)
}
