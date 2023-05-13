import { useRequestData } from "../ssr/index.js"
import { matchPath } from "./index.js"
import { Signal } from "../signal.js"
import { Component } from "../component.js"
import { Cinnabun } from "../cinnabun.js"
import { DomInterop } from "../domInterop.js"

/**
 * @typedef {import('../types.js').ComponentChild} ComponentChild
 * @typedef {import('../types.js').PropsSetter} PropsSetter
 * @typedef {import('../types.js').RouteProps} RouteProps
 */

export class RouteComponent extends Component {
  /**
   * @param {string} path
   * @param {ComponentChild} component
   */
  constructor(path, component) {
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

  /**
   * @param {*} data
   * @returns {boolean} - True if the data is a RouteComponent instance, false otherwise.
   */
  static isRouteComponent(data) {
    if (!(typeof data === "object")) return false
    return "props" in data && "path" in data.props && "pathDepth" in data.props
  }
}

export class RouterComponent extends Component {
  /**
   * @param {Signal<string>} store
   * @param {RouteComponent[]} children
   */
  constructor(store, children) {
    if (children.some((c) => !RouteComponent.isRouteComponent(c)))
      throw new Error("Must provide Route as child of Router")

    children.sort((a, b) => {
      return b.props.pathDepth - a.props.pathDepth
    })

    /**
     * @param {PropsSetter} _
     * @param {RouterComponent} self
     */
    const subscription = (_, self) => {
      return store.subscribe((val) => {
        let len = self.children.length
        while (len--) {
          const rc = self.children[len]
          rc.props.render = false
          rc.props.params = {}
        }
        if (Cinnabun.isClient) DomInterop.unRender(self)

        for (let i = 0; i < self.children.length; i++) {
          const c = self.children[i]
          const matchRes = self.matchRoute(c, useRequestData(self, "path", val))
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
    let parentRoute = this.getParentOfType((parent) =>
      RouteComponent.isRouteComponent(parent)
    )

    while (parentRoute) {
      parentPath = parentRoute.props.path + parentPath
      parentRoute = parentRoute.getParentOfType((parent) =>
        RouteComponent.isRouteComponent(parent)
      )
    }
    return parentPath
  }

  /**
   * @param {RouteComponent} c
   * @param {string} path
   * @returns {{params: any, routeMatch: RegExpMatchArray | null }}
   */
  matchRoute(c, path) {
    const cPath = this.getParentPath() + c.props.path
    return matchPath(path, cPath)
  }
}

/**
 * @param {RouteProps} param0
 * @returns {RouteComponent}
 */
export const Route = ({ path, component }) => {
  return new RouteComponent(path, component)
}

/**
 * @param {{ store: Signal<string> }} param0
 * @param {RouteComponent[]} children
 * @returns {RouterComponent}
 */
export const Router = ({ store }, children) => {
  return new RouterComponent(store, children)
}
