var fs = require("fs")
var path = require("path")

function getFiles(source, outputRoutes) {
  if (fs.lstatSync(source).isDirectory()) {
    let files = fs.readdirSync(source)
    files.forEach(function (file) {
      let curSource = path.join(source, file)
      if (fs.lstatSync(curSource).isDirectory()) {
        getFiles(curSource, outputRoutes)
      } else {
        outputRoutes.push(curSource)
      }
    })
  }
}

const scanDir = () => {
  const files = []
  getFiles("app", files)
  return files
}

const transformRoutePath = (routePath, isComponentRoute) => {
  let res = routePath
    .replaceAll(path.sep, "/")
    .replace(".tsx", "")
    .replace(".ts", "")

  if (isComponentRoute) {
    if (res.startsWith("app/")) res = `./${res.substring(4)}`
    res = res.replace("/Page", "").replaceAll("[", ":").replaceAll("]", "")
    if (res[0] === ".") res = res.substring(1)
    if (res === "") res = "/"
  }
  return res
}

// export const Route = ({ path, component }: RouteProps) => {
//   //@ts-ignore
//   console.log("~~~~~ROUTE", path, component)
//   return new RouteComponent(path, component)
// }

// export const Router = (
//   { store }: { store: Signal<string> },
//   children: RouteComponent[]
// ) => {
//   return new RouterComponent(store, children)
// }

const createFileRouter = (routes) => {
  const cwd = process.cwd().replaceAll(path.sep, "/")

  console.log("createFileRouter", routes)
  const pageRoutes = routes.filter((r) =>
    ["Page.tsx", "Page.jsx"].some((name) => r.includes(name))
  )
  const routeImports = pageRoutes.map(
    (r, i) => `import("${cwd}/${transformRoutePath(r)}")`
  )
  const content = `import * as Cinnabun from "../../"
import { Cinnabun as cb, createSignal } from "../../../"
import { Route, Router } from "../"
const pathStore = createSignal(cb.isClient ? window.location.pathname : "/")

var FileRoutes = () => {
  return (
    <Router store={pathStore}>
    ${routeImports
      .map(
        (r, i) =>
          `<Route path="${transformRoutePath(
            pageRoutes[i],
            true
          )}" component={(props) => Cinnabun.lazy(${r}, props)} />\n      `
      )
      .join("")}
  </Router>
  )
}`
  return content
}

{
  /* <Cinnabun.Suspense promise={() => import(`./test`)}>
      {(loading: boolean, component: any) => {
        return loading ? <p>loading...</p> : component.default()
      }}
    </Cinnabun.Suspense> */
}

const prebuild = () => {
  console.log("Test prebuild")
  const routes = scanDir()
  return createFileRouter(routes)
}

module.exports = {
  prebuild,
}

// return (
//   <Router store={pathStore}>
//   ${routeImports
//     .map(
//       (r, i) =>
//         `<Route path="${transformRoutePath(
//           pageRoutes[i],
//           true
//         )}" component={(props) => <Page${i} {...props} />} />\n      `
//     )
//     .join("")}
// </Router>
// )

// export const FileRouter = () => {
//   return new RouterComponent(pathStore, [
//     ${routeImports
//       .map(
//         (r, i) => `//@ts-ignore
// new RouteComponent("${transformRoutePath(
//           pageRoutes[i],
//           true
//         )}", (props) => Page${i}(props))`
//       )
//       .join(",\n")}
//   ])
// }
