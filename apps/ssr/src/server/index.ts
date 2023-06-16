import fastify, { FastifyReply, FastifyRequest } from "fastify"
import jwt from "@fastify/jwt"
import cookie from "@fastify/cookie"
import compress from "@fastify/compress"
import fStatic from "@fastify/static"
import websocket from "@fastify/websocket"
import path from "path"

import { SSR, SSRConfig } from "cinnabun/ssr"
import { App } from "../App"
import { Cinnabun } from "cinnabun"
import { socketHandler } from "./socket"
import { configureAuthRoutes } from "./auth"
import { configureChatRoutes } from "./chat"
import { Template } from "../Template"
import { log } from "../../logger.js"

const isDev = process.env.NODE_ENV === "development"

if (isDev) {
  ;(async () => {
    try {
      log("Dim", "  evaluating application... 🔍")
      const cinnabunInstance = new Cinnabun()
      await SSR.serverBake(Template(App), { cinnabunInstance, stream: null })
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
  })()
}

declare module "fastify" {
  export interface FastifyInstance {
    authenticate: {
      (request: FastifyRequest, reply: FastifyReply): Promise<void>
    }
  }
}
const port: number = parseInt(process.env.PORT ?? "3000")

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
        await request.jwtVerify({ onlyCookie: true })
      } catch (error) {
        reply.clearCookie("refreshToken")
      }
    }
  )

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
if (isDev) {
  import("../../sse").then(({ configureSSE }) => configureSSE(app))
}

app.get("/*", { onRequest: [app.authenticate] }, async (req, res) => {
  const cinnabunInstance = new Cinnabun()
  cinnabunInstance.setServerRequestData({
    path: req.url,
    data: { user: req.user },
  })

  const config: SSRConfig = {
    cinnabunInstance,
    stream: res.raw,
  }

  res.headers({
    "Content-Type": "text/html",
    "Transfer-Encoding": "chunked",
    Connection: "keep-alive",
  })
  res.raw.write("<!DOCTYPE html><html>")

  await SSR.serverBake(Template(App), config)

  res.raw.end(`</html>`)
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
