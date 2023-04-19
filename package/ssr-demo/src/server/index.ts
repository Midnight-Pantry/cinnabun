import express from "express"
import fs from "fs"
import path from "path"
import { Cinnabun } from "cinnabun"
import { App } from "../App"

const PORT = process.env.PORT || 3000
const app = express()

app.get("/", (_, res) => {
  console.time("render")
  const { html, componentTree } = Cinnabun.serverBake(App())
  console.timeEnd("render")
  // console.log(html, componentTree)

  fs.readFile(
    path.resolve("./dist/public/index.html"),
    "utf8",
    (err, indexHtml) => {
      if (err) {
        console.error(err)
        return res.status(500).send("An error occurred")
      }

      return res.send(
        indexHtml
          .replace(
            '<script id="server-props"></script>',
            `<script id="server-props">${JSON.stringify(
              componentTree
            )}</script>`
          )
          .replace('<div id="root"></div>', `<div id="root">${html}</div>`)
      )
    }
  )
})

app.use(
  express.static(path.resolve(__dirname, ".", "dist/public"), { maxAge: "30d" })
)

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
