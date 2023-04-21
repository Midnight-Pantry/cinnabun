import express from "express"
import fs from "fs"
import path from "path"
import { Cinnabun } from "cinnabun"
import { App } from "../App"

const rootId = "app"

const PORT = process.env.PORT || 3000
const app = express()

const publicDir = path.resolve(__dirname, ".", "../../dist/static")
app.use("/static", express.static(publicDir))

app.get(/.*/, (_, res) => {
  console.time("render time")
  const { html, componentTree } = Cinnabun.serverBake(App())
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
})
