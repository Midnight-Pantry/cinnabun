import express from "express"
import fs from "fs"
import path from "path"
import compression from "compression"
import session from "express-session"
import bodyParser from "body-parser"

import * as passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"

import { User, clearInvalidCookie, useAuth } from "./auth"
import { SSR } from "cinnabun/ssr"
import { App } from "../App"

const rootId = "app"

const PORT = process.env.PORT || 3000
const app = express()
app.use(compression())
app.use(bodyParser.json())
app.use(
  session({
    secret: "super-secret-secret",
    saveUninitialized: true,
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
      const user = User.get(username)
      if (!user) return done(null, false)
      if (!user.verifyPassword(password)) return done(null, false)
      return done(null, { username })
    }
  )
)

passport.serializeUser(function (user, done) {
  const res = user && "username" in user ? user.username : undefined
  done(null, res)
})
passport.deserializeUser(function (id, done) {
  const user = User.get(id as string)
  done(null, user)
})

app.use(clearInvalidCookie)

const publicDir = path.resolve(__dirname, ".", "../../dist/static")
app.use("/static", express.static(publicDir))
app.get("/favicon.ico", (_, res) => {
  res.status(404).send()
})
app.post(
  "/login",
  passport.authenticate("local", { passReqToCallback: true }),
  (req, res) => {
    res.cookie("user", JSON.stringify(req.user))
    res.status(200).send(req.user)
  }
)

app.get("/protected", useAuth, (req, res) => {
  console.log("/protected", req.isAuthenticated())
  res.send("shamow")
})

app.get(/.*/, async (req, res) => {
  console.time("render time")
  SSR.setRequestPath(req.path)
  const { html, componentTree } = await SSR.serverBake(App())
  console.timeEnd("render time")

  fs.readFile(
    path.resolve(path.resolve(__dirname, ".", "../../dist/public/index.html")),
    "utf8",
    (err, indexHtml) => {
      if (err) {
        console.error(err)
        return res.status(500).send("An error occurred")
      }

      return res.send(
        indexHtml
          .replace(
            `<div id="${rootId}"></div>`,
            `<div id="${rootId}">${html}</div>`
          )
          .replace(
            '<script id="server-props"></script>',
            `<script id="server-props">
              const root = document.getElementById('${rootId}');
              window.__cbData = {root, component: ${JSON.stringify(
                componentTree
              )}}
            </script>`
          )
      )
    }
  )
})

// app.use(
//   express.static(path.resolve(__dirname, ".", "../../dist/public"), {
//     maxAge: "30d",
//   })
// )

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
  console.log("http://localhost:3000")
})
