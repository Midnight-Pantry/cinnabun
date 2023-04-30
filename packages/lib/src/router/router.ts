import { matchPath } from "."
import { Signal, Component } from ".."
import { Cinnabun } from "../cinnabun"
import { DomInterop } from "../domInterop"
import {
  ComponentChild,
  ComponentSubscription,
  PropsSetter,
  RouteProps,
} from "../types"

class RouteComponent extends Component<any> {
  constructor(path: string, component: ComponentChild) {
    super("", {
      path,
      pathDepth: path.split("").filter((chr) => chr === "/").length,
      children: [component],
      render: false,
    })
  }

  get childArgs() {
    return [{ params: this.props.params }]
  }
}

class RouterComponent extends Component<any> {
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

export const Route = ({ path, component }: RouteProps) => {
  return new RouteComponent(path, component)
}

export const Router = (
  { store }: { store: Signal<string> },
  children: RouteComponent[]
) => {
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
