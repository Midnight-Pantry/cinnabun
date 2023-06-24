export * from "./router"
export * from "./link"
export * from "./generated"

export function matchPath(
  path: string,
  location: string
): {
  params: any
  query: any
  routeMatch: RegExpMatchArray | null
} {
  let paramNames: any[] = []
  let query: any = {}

  const cPath: string = location
  let regexPath =
    cPath.replace(/([:*])(\w+)/g, (_full, _colon, name) => {
      paramNames.push(name)
      return "([^/]+)"
    }) + "(?:/|$)"

  // match query params
  const queryMatch = path.match(/\?(.*)/)
  if (queryMatch) {
    query = queryMatch[1].split("&").reduce((str, value) => {
      if (str === null) query = {}
      const [key, val] = value.split("=")
      query[key] = val
      return query
    }, null)
  }

  let params: any = {}
  let routeMatch = path.match(new RegExp(regexPath))
  if (routeMatch !== null) {
    params = routeMatch.slice(1).reduce((str, value, index) => {
      if (str === null) params = {}
      params[paramNames[index]] = value.split("?")[0] // ensure no query params
      return params
    }, null)
  }
  return { params, query, routeMatch }
}
