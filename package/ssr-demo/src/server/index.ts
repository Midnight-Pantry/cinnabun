import fastify from "fastify"
import compress from "@fastify/compress"
import fStatic from "@fastify/static"
import websocket from "@fastify/websocket"
import fs from "fs"
import path from "path"
import { ChatMessages } from "./chat"
import { SSR } from "cinnabun/ssr"
import { App } from "../App"
import { Cinnabun } from "cinnabun"
import { sleep } from "cinnabun/utils"
import { socketHandler } from "./socket"

const rootId = "app"

const port: number = parseInt(process.env.PORT ?? "3000")
let baseHtml = ""

// load base html template
{
  fs.readFile(
    path.resolve(path.resolve(__dirname, ".", "../../dist/public/index.html")),
    "utf8",
    (err: any, indexHtml) => {
      if (err) {
        throw new Error(err)
      }
      baseHtml = indexHtml
    }
  )
}

const app = fastify()

app.register(websocket, {
  options: { maxPayload: 1048576 },
})
app.register(compress, { global: false })
app.register(fStatic, {
  prefix: "/static/",
  root: path.join(__dirname, "../../dist/static"),
})
app.get("/favicon.ico", (_, res) => {
  res.status(404).send()
})

app.register(async function () {
  app.route({
    method: "GET",
    url: "/ws",
    handler: (_, res) => res.status(400).send(),
    wsHandler: socketHandler,
  })
})

app.get("/messages", async () => {
  await sleep(100)
  return { messages: ChatMessages.getAll() }
})

app.post("/message", async (req, res) => {
  //@ts-ignore
  const { message } = req.body
  if (typeof message !== "string") {
    res.status(400).send()
    return
  }
  const msg = ChatMessages.create(message, "")
  app.websocketServer?.clients.forEach(function each(client: any) {
    client.send(JSON.stringify({ type: "+chat", data: msg }))
  })
})

app.get("/*", async (req, res) => {
  console.time("render time")
  const instance = new Cinnabun()
  instance.serverRequest = {
    path: req.url,
    data: { user: null },
  }

  const { html, componentTree } = await SSR.serverBake(App(), instance)
  console.timeEnd("render time")

  res
    .code(200)
    .header("Content-Type", "text/html; charset=utf-8")
    .send(
      baseHtml
        .replace(
          `<div id="${rootId}"></div>`,
          `<div id="${rootId}">${html}</div>`
        )
        .replace(
          '<script id="server-props"></script>',
          `<script id="server-props">
          const root = document.getElementById('${rootId}');
          window.__cbData = {root, component: ${JSON.stringify(componentTree)}}
        </script>`
        )
    )
})

app.listen({ port }, function (err) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log(`Server is listening on port ${port}`)
  console.log("http://localhost:3000")
})
