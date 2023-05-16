import { useRequestData } from "../ssr/index.js"
import { matchPath } from "./index.js"
import { Signal } from "../signal.js"
import { Component } from "../component.js"
import { Cinnabun } from "../cinnabun.js"
import { DomInterop } from "../domInterop.js"

/**
 * @typedef {import('../types').ComponentChild} ComponentChild
 * @typedef {import('../types').PropsSetter} PropsSetter
 * @typedef {import('../types').RouteProps} RouteProps
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
    return [{ params: this.getProps().params }]
  }

  /**
   * @param {*} data
   * @returns {data is RouteComponent} - True if the data is a RouteComponent instance, false otherwise.
   */
  static isRouteComponent(data) {
    if (!(typeof data === "object")) return false
    return "getProps" in data && "path" in data.getProps()
  }
}

/** @implements {Component} */
export class RouterComponent extends Component {
  /**
   * @param {Signal<string>} store
   * @param {RouteComponent[]} children
   */
  constructor(store, children) {
    children.sort((a, b) => {
      return b.getProps().pathDepth - a.getProps().pathDepth
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
          if (!RouteComponent.isRouteComponent(rc)) continue
          rc.setProps({ ...rc.getProps(), render: false, params: {} })
        }
        if (Cinnabun.isClient) DomInterop.unRender(self)

        const route = useRequestData(self, "path", val) ?? "/"

        for (let i = 0; i < self.children.length; i++) {
          const c = self.children[i]
          if (!RouteComponent.isRouteComponent(c)) continue
          const matchRes = self.matchRoute(c, route)
          if (matchRes.routeMatch) {
            c.setProps({
              ...c.getProps(),
              render: !!matchRes.routeMatch,
              params: matchRes.params ?? {},
            })
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
      parentPath = parentRoute.getProps().path + parentPath
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
    const cPath = this.getParentPath() + c.getProps().path
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
 * @template {string} T
 * @param {{ store: Signal<T> }} param0
 * @param {RouteComponent[]} children
 * @returns {RouterComponent}
 */
export const Router = ({ store }, children) => {
  return new RouterComponent(store, children)
}
