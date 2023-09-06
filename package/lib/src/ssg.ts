import fs from "fs"
import { Component } from "./component.js"
import path from "path"
import { pathToFileURL } from "node:url"
import { SSR } from "./ssr.js"
import { Cinnabun } from "./cinnabun.js"

type PageModule = {
  path: string
  module: { default: () => Component }
}

var pageModules: PageModule[] = []

export class SSG {
  static routePath: string = "/"

  static StaticRouter = (): Component => {
    return new Component("", {
      onBeforeServerRendered: async (component: Component) => {
        const path = component.cbInstance?.getServerRequestData("path")
        const pageModules = component.cbInstance?.getServerRequestData(
          "data.pageModules"
        ) as PageModule[]

        const [pageModule] = pageModules.filter(
          (pageModule) => pageModule.path === path
        )

        if (!pageModule) {
          throw new Error(`page module ${path} not found`)
        }

        component.appendChildren(pageModule.module.default)
      },
    })
  }
  static async staticBake() {
    const cwd = process.cwd()
    const distPath = path.join(cwd, "dist")
    const files = await fs.promises.readdir(distPath, { withFileTypes: true })

    let appModule: { default: () => Component } | undefined

    for await (const file of files) {
      if (file.isDirectory() && file.name === "pages") {
        pageModules = await SSG.getPageModules(path.join(distPath, "pages"))
      } else if (file.name === "App.js") {
        appModule = await import(
          pathToFileURL(path.join(distPath, "App.js")).pathname
        )
      }
    }

    // ensure that appModule is present
    if (!appModule) {
      throw new Error("App.js not found")
    }
    if (!("default" in appModule)) {
      throw new Error("App.js default export not found")
    }

    if (pageModules.length === 0) {
      throw new Error("pages directory not found")
    }

    for (const { path: modulePath } of pageModules) {
      const cinnabunInstance = new Cinnabun()
      cinnabunInstance.setServerRequestData({
        path: modulePath,
        data: {
          pageModules,
        },
      })

      const { html } = await SSR.serverBake(appModule.default(), {
        cinnabunInstance,
        stream: null,
        disableJs: true,
      })

      const pagePath =
        path.join(distPath, "generated", modulePath) +
        (modulePath === "/" ? "index" : "")

      const pageDir = path.dirname(pagePath)
      await fs.promises.mkdir(pageDir, { recursive: true })

      fs.rmSync(pagePath + ".html", { force: true })
      fs.appendFileSync(pagePath + ".html", html, "utf8")
    }
  }

  static async getPageModules(
    dir: string,
    pref: string = "/"
  ): Promise<PageModule[]> {
    const files = await fs.promises.readdir(dir, {
      withFileTypes: true,
    })

    const modules: PageModule[] = []

    for await (const file of files) {
      if (file.isFile() && file.name.endsWith(".js")) {
        const module = await import(
          pathToFileURL(path.join(dir, file.name)).pathname
        )
        if ("default" in module) {
          modules.push({
            path: path
              .join(pref, file.name.replace(/\.js$/, ""))
              .toLowerCase()
              .replace(/\\/g, "/") // convert backslashes to forward slashes
              .replace(/\/\//, "/") // remove double slashes
              .replace(/\/+$/, "") // remove trailing slashes
              .replace(/\/index$/, "/"), // remove index
            module,
          })
        }
      } else if (file.isDirectory()) {
        const subModules = await SSG.getPageModules(
          path.join(dir, file.name),
          pref + "/" + file.name
        )
        modules.push(...subModules)
      }
    }

    return modules
  }
}
