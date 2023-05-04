import fastify, { FastifyReply, FastifyRequest } from "fastify"
import jwt from "@fastify/jwt"
import cookie from "@fastify/cookie"
import compress from "@fastify/compress"
import fStatic from "@fastify/static"
import websocket from "@fastify/websocket"
import fs from "fs"
import path from "path"

import { Cinnabun } from "cinnabun"
import { SSR, SSRConfig } from "cinnabun/ssr"
import { App } from "../App"
import { socketHandler } from "./socket"
import { configureAuthRoutes } from "./auth"
import { configureChatRoutes } from "./chat"
import { Template } from "../Template"

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

//fastify config
{
  //https://www.npmjs.com/package/@fastify/jwt
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
}

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

  if (config.stream) {
    res.header("Content-Type", "text/html").status(200)
    res.header("Transfer-Encoding", "chunked")
    res.raw.write("<!DOCTYPE html><html>")
  }

  const { html, componentTree } = await SSR.serverBake(
    config.stream ? Template(App) : App(),
    config
  )

  if (config.stream) {
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
    return
  }

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
          `<script id="server-props"></script>`,
          `<script id="server-props">
            window.__cbData = {
              root: document.getElementById('${rootId}'),
              component: ${JSON.stringify(componentTree)}
            }
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
