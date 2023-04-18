import { Signal, Component } from ".."
import { PropsSetter } from "../types"

interface RouterProps {
  store: Signal<string>
}

function matchRoute(
  c: Component<any>,
  path: string
): {
  params: any
  routeMatch: RegExpMatchArray | null
} {
  let paramNames: any[] = []
  const cPath: string = c.props.path
  let regexPath =
    cPath.replace(/([:*])(\w+)/g, (_full, _colon, name) => {
      paramNames.push(name)
      return "([^/]+)"
    }) + "(?:/|$)"

  let params: any = {}
  let routeMatch = path.match(new RegExp(regexPath))
  if (routeMatch !== null) {
    params = routeMatch.slice(1).reduce((str, value, index) => {
      if (str === null) params = {}
      params[paramNames[index]] = value
      return params
    }, null)
  }
  return { params, routeMatch }
}

export const Router = ({ store }: RouterProps, children: Component<any>[]) => {
  const subscription = (_: PropsSetter, self: Component<any>) => {
    return store.subscribe((val) => {
      // sort to make sure we match on more complex routes first
      self.children.sort((a, b) => {
        return (
          (b as Component<any>).props.pathDepth -
          (a as Component<any>).props.pathDepth
        )
      })
      let len = self.children.length
      while (len--) {
        ;(self.children[len] as Component<any>).props.render = false
      }
      self.unRender()

      for (let i = 0; i < self.children.length; i++) {
        const c = self.children[i] as Component<any>
        const matchRes = matchRoute(c, val)
        if (matchRes.routeMatch) {
          c.props.render = !!matchRes.routeMatch
          c.props.params = matchRes.params
          break
        }
      }
      if (self.mounted) self.reRender()
    })
  }
  return new Component<any>("", { subscription, children })
}
