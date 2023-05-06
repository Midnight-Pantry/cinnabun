var fs = require("fs")
var path = require("path")

function copyFileSync(source, target) {
  var targetFile = target

  // If target is a directory, a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source))
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source))
}

function copyFolderRecursiveSync(source, target, outputRoutes) {
  // Check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source))
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder)
  }

  // Copy
  if (fs.lstatSync(source).isDirectory()) {
    let files = fs.readdirSync(source)
    files.forEach(function (file) {
      var curSource = path.join(source, file)
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder, outputRoutes)
      } else {
        copyFileSync(curSource, targetFolder)
        outputRoutes.push(curSource)
      }
    })
  }
}

const cloneDir = () => {
  if (!fs.existsSync(".cb")) {
    fs.mkdirSync(".cb")
  }
  const outputRoutes = []
  copyFolderRecursiveSync("src", ".cb", [])
  copyFolderRecursiveSync("app", ".cb", outputRoutes)
  return outputRoutes
}

const transformRoutePath = (routePath, isComponentRoute) => {
  let res = routePath
    .replaceAll(path.sep, "/")
    .replace(".tsx", "")
    .replace(".ts", "")

  if (res.startsWith("app/")) res = `./${res.substring(4)}`
  if (isComponentRoute) {
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
  console.log("createFileRouter", routes)
  const pageRoutes = routes.filter((r) =>
    ["Page.tsx", "Page.jsx"].some((name) => r.includes(name))
  )
  const routeImports = pageRoutes.map(
    (r, i) => `import Page${i} from "${transformRoutePath(r)}"`
  )
  const content = `import * as Cinnabun from "cinnabun"
import { Cinnabun as cb, createSignal } from "cinnabun"
import { Route, Router } from "cinnabun/router"
${routeImports.join("\n")}
const pathStore = createSignal(
  cb.isClient ? window.location.pathname : "/"
)
export const FileRouter = () => {
  return (
    <Router store={pathStore}>
    ${routeImports
      .map(
        (r, i) =>
          `<Route path="${transformRoutePath(
            pageRoutes[i],
            true
          )}" component={(props) => <Page${i} {...props} />} />\n      `
      )
      .join("")}
  </Router>
  )
}

  `
  fs.writeFileSync(path.join("app", "FileRouter.tsx"), content)
  fs.writeFileSync(path.join(".cb", "app", "FileRouter.tsx"), content)
}

const prebuild = async () => {
  console.log("Test prebuild")
  const routes = cloneDir()
  createFileRouter(routes)
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
