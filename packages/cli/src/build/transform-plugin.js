"use strict"
const fs = require("fs")
const { prebuild } = require("./prebuild")

const regexPatterns = {
  ServerPromise:
    /async function\s+(\w+)\s*\([^)]*\)\s*:\s*ServerPromise\s*<[^>]*>\s*{(?:[^{}]*|{(?:[^{}]*|{(?:[^{}]*|{[^{}]*})*})*})*}/gm,
  $fn: /async function\s+(\$[\w\d]+)\(\): Promise<[\w\d]+>\s*{(?:[^{}]*|{(?:[^{}]*|{(?:[^{}]*|{[^{}]*})*})*})*}/gm,
}

const replaceServerFunctions = (rgxPattern) => ({
  name: "function-replacer-plugin",
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const contents = await fs.promises.readFile(args.path, "utf8")

      const transformedContents = contents.replace(
        rgxPattern,
        (match, p1) => `async function ${p1}() {}`
      )
      return { contents: transformedContents, loader: "tsx" }
    })
  },
})

const generateServer = () => ({
  name: "generate-server-plugin",
  setup(build) {
    build.onLoad({ filter: /App\.tsx?$/ }, async (args) => {
      console.log("GENERATE_SERVER")
      const contents = await fs.promises.readFile(args.path, "utf8")
      const server = `
      export default function createServer() {
           
        const app = fastify()
      
        app.register(compress, { global: false })
        app.register(fStatic, {
          prefix: "/static/",
          root: path.join(__dirname, "../../dist/static"),
        })
        app.get("/favicon.ico", (_, res) => {
          res.status(404).send()
        })
      
        app.get("/*", async (req, res) => {
          const cinnabunInstance = new Cinnabun.Cinnabun()
          console.log("cinnabunInstance", cinnabunInstance)

          console.log("req.url", req.url)
      
          cinnabunInstance.setServerRequestData({
            path: req.url,
            data: {},
          })
      
          const config: SSRConfig = {
            cinnabunInstance,
            stream: res.raw,
          }
      
          res.header("Content-Type", "text/html").status(200)
          res.header("Transfer-Encoding", "chunked")
          res.raw.write("<!DOCTYPE html><html>")
      
          const { componentTree } = await SSR.serverBake(App(), config)

          console.log("SUPERFISH")
      
          res.raw.write("<script id='server-props'>window.__cbData = {root: document.documentElement,component: " + JSON.stringify(componentTree) + "}</script><script type='module' src='static/index.js'></script></html>")

          res.raw.end()
        })
      
        return app
      }
      globalThis.createServer = createServer;
      `

      return {
        contents: `
        import fastify from "fastify"
        import compress from "@fastify/compress"
        import fStatic from "@fastify/static"
        import path from "path"
        
        import { SSR, SSRConfig } from "cinnabun/ssr"
        import { ComponentFunc } from "cinnabun/src/types"

          ${contents}
          //~~~~~~~~
          ${server}
        `,
        loader: "tsx",
      }
    })
  },
})

const generateFileRouter = () => ({
  name: "fileRoute-generator-plugin",
  setup(build) {
    build.onLoad({ filter: /fileRouter\.js?$/ }, async (args) => {
      const contents = await fs.promises.readFile(args.path, "utf8")

      const replaced = contents
        .replace("//@ts-expect-error TS2552", "")
        .replace('var FileRoutes = "$FILE_ROUTES"', prebuild())

      console.log("REPLACED", replaced)

      return {
        contents: replaced,
        loader: "js",
      }
    })
  },
})

module.exports = {
  replaceServerFunctions,
  regexPatterns,
  generateFileRouter,
  generateServer,
}
