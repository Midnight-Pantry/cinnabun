import fastify from "fastify"
import compress from "@fastify/compress"
import fStatic from "@fastify/static"
import path from "path"
import { Cinnabun } from "cinnabun"
import { SSR, SSRConfig } from "cinnabun/ssr"
import { ComponentFunc } from "cinnabun/src/types"

export function createServer(App: ComponentFunc) {
  //const { App } = await import(path.resolve(process.cwd(), "src", "App"))

  //console.log("Creating server - App: ", App)

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
    console.log("req.url: ", req.url)
    const cinnabunInstance = new Cinnabun()

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

    res.raw.write(`
      <script id="server-props">
        window.__cbData = {
          root: document.documentElement,
          component: ${JSON.stringify(componentTree)}
        }
      </script>
      <script type="module" src="/static/index.js"></script>
      </html>
    `)
    res.raw.end()
  })

  return app
}
