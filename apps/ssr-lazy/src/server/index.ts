import fastify from "fastify"
import compress from "@fastify/compress"
import fStatic from "@fastify/static"
import path from "path"
import { fileURLToPath } from "url"

import { SSR, SSRConfig } from "cinnabun/ssr"
import { App } from "../App"
import { Cinnabun } from "cinnabun"
import { Template } from "../Template"
import { log } from "../../logger.js"

const isDev = process.env.NODE_ENV === "development"

if (isDev) {
  try {
    log("Dim", "  evaluating application... 🔍")
    const cinnabunInstance = new Cinnabun()
    await SSR.serverBake(Template(App), { cinnabunInstance })
    log("Dim", "  good to go! ✅")
  } catch (error) {
    if ("message" in (error as Error)) {
      const err = error as Error
      log(
        "FgRed",
        `
Failed to evaluate application.
${err.stack}
`
      )
      process.exit(96)
    }
  }
}

const port: number = parseInt(process.env.PORT ?? "3000")

const app = fastify()

app.register(compress, { global: false })
app.register(fStatic, {
  prefix: "/static/",
  root: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../dist/static"
  ),
})
app.get("/favicon.ico", (_, res) => {
  res.status(404).send()
})

if (isDev)
  await import("../../sse").then(({ configureSSE }) => configureSSE(app))

app.get("/*", async (req, res) => {
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

  const { componentTree } = await SSR.serverBake(Template(App), config)

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

app.listen({ port }, function (err) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  log(
    "FgGreen",
    `
Server is listening on port ${port} - http://localhost:3000`
  )
})
