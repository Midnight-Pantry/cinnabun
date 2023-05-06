var fs = require("fs")
var path = require("path")

function getFiles(source, outputRoutes = []) {
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
  return outputRoutes
}

const scanDir = () => {
  return getFiles("app")
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

const createFileRouter = (routes) => {
  const cwd = process.cwd().replaceAll(path.sep, "/")

  const pageRoutes = routes.filter((r) =>
    ["Page.tsx", "Page.jsx"].some((name) => r.includes(name))
  )
  const routeImports = pageRoutes.map(
    (r) => `import("${cwd}/${transformRoutePath(r)}")`
  )
  const content = `import * as Cinnabun from "../../"
import { Cinnabun as cb, createSignal } from "../../../"
import { RouteComponent, RouterComponent } from "../"
const pathStore = createSignal(cb.isClient ? window.location.pathname : "/")

var FileRoutes = () => {
  return new RouterComponent(pathStore, [
    ${routeImports
      .map(
        (r, i) =>
          `new RouteComponent("${transformRoutePath(
            pageRoutes[i],
            true
          )}", (props) => Cinnabun.lazy(${r}, props)),\n      `
      )
      .join("")}
  ])
}`
  return content
}
const prebuild = () => {
  const routes = scanDir()
  return createFileRouter(routes)
}

module.exports = {
  prebuild,
}
