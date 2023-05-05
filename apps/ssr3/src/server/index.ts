import fastify from "fastify"
import compress from "@fastify/compress"
import fStatic from "@fastify/static"
import path from "path"

import { SSR, SSRConfig } from "cinnabun/ssr"
import { App } from "../App"
import { Cinnabun } from "cinnabun"
import { Template } from "../Template"

const port: number = parseInt(process.env.PORT ?? "3000")
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
      <script src="/static/index.js"></script>
    `)
  res.raw.write("</html>")
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
