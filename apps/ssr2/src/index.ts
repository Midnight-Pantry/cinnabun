import fastify from "fastify"

import { Component } from "cinnabun"

const port: number = parseInt(process.env.PORT ?? "3000")

const x = new Component("asdasd")
console.log(x.tag)

const app = fastify()

app.get("/*", async (req, res) => {
  res.send("herro")
})

app.listen({ port }, function (err) {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }

  console.log(`Server is listening on port ${port}`)
  console.log("http://localhost:3000")
})
