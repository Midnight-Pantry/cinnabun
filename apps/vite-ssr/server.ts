import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import express from "express"
import { createServer as createViteServer } from "vite"
import { Cinnabun } from "cinnabun"
import { SSR } from "cinnabun/ssr"

//https://vitejs.dev/guide/ssr.html

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const template = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf-8")

const rootId = "app"

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
    esbuild: {
      jsxInject: "import * as Cinnabun from 'cinnabun'",
      jsx: "transform",
      jsxFactory: "Cinnabun.h",
      jsxFragment: "Cinnabun.fragment",
      jsxImportSource: "Cinnabun",
    },
  })

  // Use vite's connect instance as middleware. If you use your own
  // express router (express.Router()), you should use router.use
  app.use(vite.middlewares)

  app.use("*", async (req, res, next) => {
    const reqPath = req.originalUrl

    try {
      const { default: App } = await vite.ssrLoadModule("./src/App")

      const cinnabunInstance = new Cinnabun()
      cinnabunInstance.setServerRequestData({
        path: reqPath,
        data: {},
      })

      //    Apply Vite HTML transforms. This injects the Vite HMR client,
      //    and also applies HTML transforms from Vite plugins, e.g. global
      //    preambles from @vitejs/plugin-react
      const devTemplate = await vite.transformIndexHtml(reqPath, template)

      //    Bake!
      //@ts-ignore
      const { html, componentTree } = await SSR.serverBake(App(), {
        cinnabunInstance,
      })

      res
        .status(200)
        .set({ "Content-Type": "text/html" })
        .end(
          devTemplate
            .replace(
              `<div id="${rootId}"></div>`,
              `<div id="${rootId}">${html}</div>`
            )
            .replace(
              `<script id="server-props"></script>`,
              `<script id="server-props">
                window.__cbData = {
                  root: document.getElementById('${rootId}'),
                  component: ${JSON.stringify(componentTree)}
                }
              </script>`
            )
        )
    } catch (e: any) {
      // If an error is caught, let Vite fix the stack trace so it maps back
      // to your actual source code.
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })

  app.listen(5173, () => {
    console.log("app listening - http://localhost:5173")
  })
}

createServer()
