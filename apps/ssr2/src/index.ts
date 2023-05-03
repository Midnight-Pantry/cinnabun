import * as Cinnabun from "cinnabun"
import fastify from "fastify"
import fStatic from "@fastify/static"
import path from "path"

import { SSR, SSRConfig } from "cinnabun/ssr"
import { CB_ROUTE_MANIFEST } from "./routeManifest"

const port: number = parseInt(process.env.PORT ?? "3000")

const app = fastify()

app.register(fStatic, {
  prefix: "/static/",
  root: path.join(__dirname, "../../dist/static"),
})
app.get("/favicon.ico", (_, res) => {
  res.status(404).send()
})

app.get("/*", async (req, res) => {
  const cinnabunInstance = new Cinnabun.Cinnabun()
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

  const Template = (await import("../app/Template")).default

  let reqPath = req.url.replaceAll("/", path.sep)

  const page =
    CB_ROUTE_MANIFEST[reqPath] ?? CB_ROUTE_MANIFEST[reqPath + path.sep]

  const filePath = path.join("file://", process.cwd(), page)

  try {
    const file = (await import(filePath)).default.default
    const x = file()
    const { componentTree } = await SSR.serverBake(
      Template({
        children: [x],
      }),
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
  console.log("http://localhost:3000")
})
