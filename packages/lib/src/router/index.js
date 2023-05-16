export * from "./router"
export * from "./link"
export * from "./generated"

/**
 * @param {string} path
 * @param {string} location
 * @returns {{ params: any, routeMatch: RegExpMatchArray | null }}
 */
export function matchPath(path, location) {
  let paramNames = []
  const cPath = location
  let regexPath =
    cPath.replace(/([:*])(\w+)/g, (_full, _colon, name) => {
      paramNames.push(name)
      return "([^/]+)"
    }) + "(?:/|$)"

  let params = {}
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
