import express from "express"
import fs from "fs"
import path from "path"
import compression from "compression"
import session from "express-session"
import bodyParser from "body-parser"
import { createServer } from "http"

import * as passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"

import { UserService, clearInvalidCookie, useAuth } from "./auth"
import { ChatMessages } from "./chat"
import { SSR } from "cinnabun/ssr"
import { App } from "../App"
import { Cinnabun } from "cinnabun"
import { sleep } from "cinnabun/utils"

const rootId = "app"

const PORT = process.env.PORT || 3000
const publicDir = path.resolve(__dirname, ".", "../../dist/static")
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

const app = express()
const server = createServer(app)

// express app config
{
  app.use(compression())
  app.use(bodyParser.json())
  app.use(
    session({
      secret: "super-secret-secret",
      saveUninitialized: true,
      resave: true,
      cookie: {
        httpOnly: false,
      },
    })
  )

  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      function (username, password, done) {
        const user = UserService.get(username)
        if (!user) return done(null, false)
        if (!UserService.verifyPassword(user, password))
          return done(null, false)
        return done(null, { username })
      }
    )
  )

  passport.serializeUser(function (user, done) {
    const res = user && "username" in user ? user.username : undefined
    done(null, res)
  })
  passport.deserializeUser(function (id, done) {
    const user = UserService.get(id as string)
    done(null, user)
  })
  app.use(clearInvalidCookie)

  app.use("/static", express.static(publicDir))
  app.get("/favicon.ico", (_, res) => {
    res.status(404).send()
  })
}

// routes
{
  app.post(
    "/login",
    passport.authenticate("local", { passReqToCallback: true }),
    (req, res) => {
      res.cookie("user", JSON.stringify(req.user))
      res.status(200).send(req.user)
    }
  )
  app.post("/logout", (req, res) => {
    try {
      res.clearCookie("user")
      req.session.destroy((err) => {
        if (err) throw new Error(err)
      })
    } catch (error) {
      return res.status(500).send()
    }
    return res.status(200).send()
  })

  app.get("/messages", async (_, res) => {
    await sleep(100)
    return res.json({ messages: ChatMessages.getAll() })
  })
  app.post("/message", useAuth, (req, res) => {
    const { user } = req
    if (!user) return res.status(403).send()
    const username = (("username" in user && user.username) as string) ?? ""
    if (!username) return res.status(403).send()
    const { message } = req.body

    return res
      .status(200)
      .send({ result: ChatMessages.create(message, username) })
  })

  app.get("/protected", useAuth, (req, res) => {
    console.log("/protected", req.isAuthenticated())
    res.send("shamow")
  })
}

app.get(/.*/, async (req, res) => {
  console.time("render time")

  const instance = new Cinnabun()
  instance.serverRequest = {
    path: req.path,
    data: { user: req.user },
  }

  const { html, componentTree } = await SSR.serverBake(App(), instance)
  console.timeEnd("render time")

  return res.send(
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

// app.use(
//   express.static(path.resolve(__dirname, ".", "../../dist/public"), {
//     maxAge: "30d",
//   })
// )

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
  console.log("http://localhost:3000")
})
