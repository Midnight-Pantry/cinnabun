import path from "path"
import fastify, { FastifyReply, FastifyRequest } from "fastify"
import jwt from "@fastify/jwt"
import cookie from "@fastify/cookie"
import compress from "@fastify/compress"
import fStatic from "@fastify/static"
import websocket from "@fastify/websocket"

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: {
      (request: FastifyRequest, reply: FastifyReply): Promise<void>
    }
    verify: {
      (request: FastifyRequest): Promise<void>
    }
  }
}

import { Cinnabun } from "cinnabun"
import { SSR, SSRConfig } from "cinnabun/ssr"

import { App } from "../App.jsx"
import { configureAuthRoutes } from "./auth.js"
import { configureChatRoutes } from "./chat.js"
import { Template } from "../Template.jsx"
import { socketHandler } from "./socket.js"

const port: number = parseInt(process.env.PORT ?? "3000")
const staticFilesDir = path.join(__dirname, "..", "static")

const app = fastify()

app.register(jwt, {
  secret: "super-secret secret",
  cookie: {
    cookieName: "refreshToken",
    signed: false,
  },
  sign: {
    expiresIn: "30m",
  },
})
app.register(cookie)
app.decorate(
  "authenticate",
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  }
)
app.decorate("verify", async (request: FastifyRequest) => {
  try {
    await request.jwtVerify({ onlyCookie: true })
  } catch (error) {}
})
app.register(compress, { global: false })
app.register(fStatic, {
  prefix: "/static/",
  root: staticFilesDir,
})
app.get("/favicon.ico", (_, res) => {
  res.status(404).send()
})

app.register(websocket, {
  options: { maxPayload: 1048576 },
})
app.register(async function () {
  app.route({
    method: "GET",
    url: "/ws",
    handler: (_, res) => res.status(400).send(),
    wsHandler: socketHandler,
  })
})

configureAuthRoutes(app)
configureChatRoutes(app)

app.get("/*", { onRequest: [app.verify] }, async (req, res) => {
  const cinnabunInstance = new Cinnabun()
  cinnabunInstance.setServerRequestData({
    path: req.url,
    data: { user: req.user },
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
      </html>
    `)
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
