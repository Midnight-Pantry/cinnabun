export * from "./router"
export * from "./link"
export * from "./generated"

export function matchPath(
  path: string,
  location: string
): {
  params: any
  routeMatch: RegExpMatchArray | null
} {
  let paramNames: any[] = []
  const cPath: string = location
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
