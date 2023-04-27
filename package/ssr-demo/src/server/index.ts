import fastify, { FastifyReply, FastifyRequest } from "fastify"
import jwt from "@fastify/jwt"
import cookie from "@fastify/cookie"
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

app.post("/login", async (req, res) => {
  const { username, password } = req.body as {
    username?: string
    password?: string
  }
  if (!username || !password) {
    res.status(400).send()
    return
  }
  const token = app.jwt.sign({ username })
  const refreshToken = await res.jwtSign({ username }, { expiresIn: "1d" })
  res
    .setCookie("refreshToken", refreshToken, {
      domain: "localhost",
      path: "/",
      httpOnly: false,
      sameSite: true, // alternative CSRF protection
    })
    .code(200)
    .send({ token })
})

app.post("/logout", async (req, res) => {
  res.clearCookie("refreshToken")
  res.code(200).send()
})

app.get("/messages", async () => {
  await sleep(100)
  return { messages: ChatMessages.getAll() }
})

app.post("/message", { onRequest: [app.authenticate] }, async (req, res) => {
  const { message } = req.body as { message?: string }
  const { username } = req.user as { username: string }
  if (typeof message !== "string") {
    res.status(400).send()
    return
  }
  const msg = ChatMessages.create(message, username)
  app.websocketServer?.clients.forEach(function each(client: any) {
    client.send(JSON.stringify({ type: "+chat", data: msg }))
  })
})

app.get("/*", { onRequest: [app.verify] }, async (req, res) => {
  console.time("render time")
  const instance = new Cinnabun()
  instance.serverRequest = {
    path: req.url,
    data: { user: req.user },
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
