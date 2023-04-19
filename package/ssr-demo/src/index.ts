import express from "express"
import fs from "fs"
import path from "path"
//import { Cinnabun } from "cinnabun"
//import { App } from "./App"

//const cbApp = App().render()
//const x = Cinnabun.bake(cbApp)

console.log("test")

const PORT = process.env.PORT || 3000
const app = express()

//console.log(cbApp.toString())

app.get("/", (_, res) => {
  fs.readFile(path.resolve("./dist/public/index.html"), "utf8", (err, data) => {
    if (err) {
      console.error(err)
      return res.status(500).send("An error occurred")
    }

    return res.send(
      data.replace('<div id="root"></div>', `<div id="root">${123}</div>`)
    )
  })
})

app.use(express.static(path.resolve(__dirname, ".", "dist"), { maxAge: "30d" }))

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})
