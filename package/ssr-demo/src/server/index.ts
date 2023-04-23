import express from "express"
import fs from "fs"
import path from "path"
import compression from "compression"
import { SSR } from "cinnabun/ssr"
import { App } from "../App"

const rootId = "app"

const PORT = process.env.PORT || 3000
const app = express()
app.use(compression())

const publicDir = path.resolve(__dirname, ".", "../../dist/static")
app.use("/static", express.static(publicDir))
app.get("/favicon.ico", (_, res) => {
  res.status(404).send()
})

app.get(/.*/, (req, res) => {
  console.time("render time")
  SSR.setRequestPath(req.path)
  const { html, componentTree } = SSR.serverBake(App())
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
