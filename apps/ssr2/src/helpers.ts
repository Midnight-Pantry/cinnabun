import * as fs from "fs"
import * as path from "path"
import * as vm from "vm"

import { Component } from "cinnabun"
import { build } from "esbuild"
import assert from "assert"

export type RouteMap = { [key: string]: string }

export type ComponentInfo = {
  path: string
  component: Component<any>
}

export function requireFromString(code: string): any {
  const module = { exports: {} }
  const context = { module, exports: module.exports }
  vm.runInNewContext(code, context)
  return module.exports
}

async function buildComponent(
  filePath: string,
  routeMap: RouteMap
): Promise<string> {
  console.log("~~~~~buildComponent", filePath)

  const componentName = path.join(
    path.dirname(filePath),
    path.basename(filePath)
  )
  const outputPath = path.join(
    "dist",
    componentName.replace(".tsx", "").replace(".ts", "").replace(".jsx", "") +
      ".js"
  )

  let pathKey = filePath.toLowerCase()
  if (pathKey.endsWith(path.sep)) {
    pathKey = pathKey.substring(0, pathKey.length - 1)
  }

  routeMap[
    path.sep +
      pathKey
        .replace("app" + path.sep, "")
        .replace("page.tsx", "")
        .replace("page.jsx", "")
  ] = outputPath

  await build({
    //bundle: true,
    entryPoints: [filePath],
    outfile: outputPath,
    jsx: "transform",
    jsxFactory: "Cinnabun.h",
    jsxFragment: "Cinnabun.fragment",
    jsxImportSource: "Cinnabun",
    tsconfig: "_tsconfig.json",
    format: "cjs",
    target: "esnext",
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  })

  console.log("build file", outputPath)

  return outputPath
}

export async function prebuild(folderPath: string): Promise<RouteMap> {
  const routeMap: RouteMap = {}
  const files = fs.readdirSync(folderPath)
  const entry = files.find((f) => f === "Template.tsx")
  const page = files.find((f) => f === "Page.tsx")
  assert(entry && page, "Must provide app Template.tsx & Page.tsx files")

  for await (const f of files) {
    const qPath = path.join(folderPath, f)
    if (fs.statSync(qPath).isDirectory()) {
      await buildRecursive(qPath, routeMap)
      continue
    }
    await buildComponent(qPath, routeMap)
  }

  try {
    const dir = "./.cb"
    if (!fs.existsSync(dir)) fs.mkdirSync(dir)

    fs.writeFileSync(
      path.join(dir, "route-manifest.json"),
      JSON.stringify(routeMap)
    )
    // file written successfully
  } catch (err) {
    console.error(err)
  }

  return routeMap
}

async function buildRecursive(folderPath: string, routeMap: RouteMap) {
  const files = fs.readdirSync(folderPath)
  for await (const f of files) {
    const qPath = path.join(folderPath, f)
    if (fs.statSync(qPath).isDirectory()) {
      await buildRecursive(qPath, routeMap)
      continue
    }
    await buildComponent(qPath, routeMap)
  }
}
