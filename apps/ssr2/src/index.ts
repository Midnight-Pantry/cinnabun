import fastify from "fastify"
import fStatic from "@fastify/static"
import path from "path"

import { Cinnabun } from "cinnabun"
import { SSR, SSRConfig } from "cinnabun/ssr"
import { CB_ROUTE_MANIFEST } from "./routeManifest"

const port: number = parseInt(process.env.PORT ?? "3001")

const app = fastify()

const publicPath = path.join(process.cwd(), "public")

app.register(fStatic, {
  prefix: "/static/",
  root: publicPath,
})
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
    stream: res.raw,
  }

  res.header("Content-Type", "text/html").status(200)
  res.header("Transfer-Encoding", "chunked")
  res.raw.write("<!DOCTYPE html><html>")

  const reqPath = req.url.replaceAll("/", path.sep)

  const routes = CB_ROUTE_MANIFEST

  const pageMatch = routes[reqPath] ?? routes[reqPath + path.sep]
  const templateMatch =
    routes[reqPath + "template.tsx"] ??
    routes[reqPath + path.sep + "template.tsx"]

  const pageFilePath = path.join("file://", process.cwd(), pageMatch)
  const templateFilePath = path.join("file://", process.cwd(), templateMatch)

  try {
    const template = (
      await import(templateMatch ? templateFilePath : "../app/Template")
    ).default.default
    const file = (await import(pageFilePath)).default.default
    const x = file()
    const { componentTree } = await SSR.serverBake(
      template({ children: [x] }),
      config
    )
    res.raw.write(`
    <script id="server-props">
      window.__cbData = {
        root: document.documentElement,
        component: ${JSON.stringify(componentTree)}
      }
    </script>
    <script src="/static/index.js"></script>
    </html>`)
  } catch (error: any) {
    console.error(error)
    throw new Error(error)
  }

  res.raw.end()
})

app.listen({ port }, function (err) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log(`Server is listening on port ${port}`)
  console.log("http://localhost:3001")
})
