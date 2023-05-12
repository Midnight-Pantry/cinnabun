import path from "path"
import express from "express"
import { Cinnabun } from "cinnabun"
import { SSR, SSRConfig } from "cinnabun/ssr"
import { ComponentFunc } from "cinnabun/src/types"
//import { createServer as createViteServer } from "vite"

export async function createServer(App: ComponentFunc) {
  console.log("Creating server", process.cwd())
  const publicDir = path.resolve(process.cwd(), "dist", "static")

  const app = express()
  app.use("/static", express.static(publicDir))

  // const vite = await createViteServer({
  //   server: { middlewareMode: true },
  //   appType: "custom",
  //   esbuild: {
  //     jsx: "transform",
  //     jsxInject: "import * as Cinnabon from 'cinnabun'",
  //     jsxFactory: "Cinnabon.h",
  //     jsxFragment: "Cinnabon.fragment",
  //   },
  // })

  // app.use(vite.middlewares)
  app.get("/favicon.ico", (_, res) => {
    res.status(404).send()
  })

  app.get("/*", async (req, res) => {
    const cinnabunInstance = new Cinnabun()

    cinnabunInstance.setServerRequestData({
      path: req.url,
      data: {},
    })

    const config: SSRConfig = {
      cinnabunInstance,
      stream: res,
    }

    res.header("Content-Type", "text/html").status(200)
    res.header("Transfer-Encoding", "chunked")
    res.write("<!DOCTYPE html><html>")

    const { componentTree } = await SSR.serverBake(App(), config)

    res.write(`
      <script id="server-props">
        window.__cbData = {
          root: document.documentElement,
          component: ${JSON.stringify(componentTree)}
        }
      </script>
      <script type="module" src="/static/index.js"></script>
      </html>
    `)
    res.end()
  })

  return app
}
