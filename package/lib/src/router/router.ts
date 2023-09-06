import { matchPath } from "./index.js"
import { Signal, Component } from "../index.js"
import { Cinnabun } from "../cinnabun.js"
import { DomInterop } from "../domInterop.js"
import { ComponentChild, PropsSetter, RouteProps } from "../types.js"

export class RouteComponent extends Component {
  isRouteComponent: boolean = true
  constructor(path: string, component: ComponentChild) {
    super("", {
      path,
      pathDepth: path.split("").filter((chr) => chr === "/").length,
      children: [component],
      visible: false,
    })
  }

  get childArgs() {
    return [{ params: this.props.params, query: this.props.query }]
  }

  static isRouteComponent(val: any): val is RouteComponent {
    if (typeof val !== "object") return false
    return val instanceof RouteComponent || "isRouteComponent" in val
  }
}

export class RouterComponent extends Component {
  static pathStore = new Signal<string>(
    Cinnabun.isClient ? window.location.pathname : "/"
  )

  constructor(
    store: Signal<string> = RouterComponent.pathStore,
    children: RouteComponent[]
  ) {
    if (children.some((c) => !(c instanceof RouteComponent)))
      throw new Error("Must provide Route as child of Router")

    // Sort children by path depth so that the most specific path is matched first
    children.sort((a, b) => {
      return (
        (b as RouteComponent).props.pathDepth -
        (a as RouteComponent).props.pathDepth
      )
    })

    const subscription = (_: PropsSetter, self: Component) => {
      return store.subscribe((val) => {
        for (const c of self.children as RouteComponent[]) {
          if (Cinnabun.isClient && c.props.visible) DomInterop.unRender(c)
          c.props.visible = false
          c.props.params = {}
        }

        let nextRoute: RouteComponent | undefined = undefined
        for (let i = 0; i < self.children.length; i++) {
          const c = self.children[i] as RouteComponent
          const matchRes = (self as RouterComponent).matchRoute(
            c,
            this.useRequestData<string>("path", val)!
          )
          if (matchRes.routeMatch) {
            nextRoute = c
            c.props.visible = !!matchRes.routeMatch
            c.props.params = matchRes.params ?? {}
            c.props.query = matchRes.query ?? {}
            break
          }
        }
        if (Cinnabun.isClient && self.mounted && nextRoute)
          DomInterop.reRender(nextRoute)
      })
    }

    super("", { subscription, children })
  }

  getParentPath() {
    let parentPath = ""
    let parentRoute = this.getParentRoute(this)

    while (parentRoute) {
      parentPath = parentRoute.props.path + parentPath
      parentRoute = this.getParentRoute(parentRoute)
    }
    return parentPath
  }

  getParentRoute(component: Component) {
    if (!component.parent) return undefined

    if (RouteComponent.isRouteComponent(component.parent))
      return component.parent

    let parent: Component | null = component.parent

    while (parent) {
      if (RouteComponent.isRouteComponent(parent)) return parent
      parent = parent.parent
    }
    return undefined
  }

  matchRoute(
    c: RouteComponent,
    path: string
  ): {
    params: any
    query: any
    routeMatch: RegExpMatchArray | null
  } {
    const cPath: string = this.getParentPath() + c.props.path

    return matchPath(path, cPath)
  }
}

if (Cinnabun.isClient) {
  RouterComponent.pathStore.value = window.location.pathname
  window.addEventListener("popstate", (e) => {
    RouterComponent.pathStore.value =
      (e.target as Window)?.location.pathname ?? "/"
  })
}

export const Route = ({ path, component }: RouteProps) => {
  return new RouteComponent(path, component)
}

export const Router = (
  { store }: { store?: Signal<string> },
  children: RouteComponent[]
) => {
  return new RouterComponent(store, children)
}
