import express from "express"
import { Cinnabun } from "cinnabun"
import { SSR, SSRConfig } from "cinnabun/ssr"

import { App } from "../App.jsx"
import { configureAuthRoutes } from "./auth.js"
import { configureChatRoutes } from "./chat.js"
import { Template } from "../Template.jsx"

const port: number = parseInt(process.env.PORT ?? "3000")

const app = express()

configureAuthRoutes(app)
configureChatRoutes(app)

app.get("/*", async (req, res) => {
  const cinnabunInstance = new Cinnabun()
  cinnabunInstance.setServerRequestData({
    path: req.url,
    //@ts-ignore
    data: { user: req.user },
  })

  const config: SSRConfig = {
    cinnabunInstance,
    stream: res,
  }

  res.header("Content-Type", "text/html").status(200)
  res.header("Transfer-Encoding", "chunked")
  res.write("<!DOCTYPE html><html>")

  const { componentTree } = await SSR.serverBake(Template(App), config)

  res.write(`
      <script id="server-props">
        window.__cbData = {
          root: document.documentElement,
          component: ${JSON.stringify(componentTree)}
        }
      </script>
      <script src="/static/index.js"></script>
      </html>
    `)
  res.end()
})

app.listen({ port }, function () {
  console.log(`Server is listening on port ${port}`)
  console.log("http://localhost:3000")
})
