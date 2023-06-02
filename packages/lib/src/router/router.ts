import { useRequestData } from "../ssr"
import { matchPath } from "."
import { Signal, Component } from ".."
import { Cinnabun } from "../cinnabun"
import { DomInterop } from "../domInterop"
import { ComponentChild, PropsSetter, RouteProps } from "../types"

export class RouteComponent extends Component {
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

export class RouterComponent extends Component {
  constructor(store: Signal<string>, children: RouteComponent[]) {
    if (children.some((c) => !(c instanceof RouteComponent)))
      throw new Error("Must provide Route as child of Router")

    if (Cinnabun.isClient) {
      window.addEventListener("popstate", (e) => {
        store.value = (e.target as Window)?.location.pathname ?? "/"
      })
    }

    children.sort((a, b) => {
      return (
        (b as RouteComponent).props.pathDepth -
        (a as RouteComponent).props.pathDepth
      )
    })

    const subscription = (_: PropsSetter, self: Component) => {
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
            useRequestData<string>(self, "path", val)!
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
  return new RouterComponent(store, children)
}
