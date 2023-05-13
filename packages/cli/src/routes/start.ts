import { Command, Option } from "commander"
import path from "path"

import type { createServer as ServerCreator } from "../build/server"

const plugin_createServer = path.join(
  path.dirname(import.meta.url),
  "..",
  "build",
  "server.js"
)

export default new Command("start")
  .description("start your cinnabun project")
  .addOption(new Option("-p, --port <port>", "port to run on").default("3000"))
  .addOption(
    new Option("-h, --host <host>", "host to run on").default("localhost")
  )
  .action(async ({ port }) => {
    const { createServer } = (await import(
      plugin_createServer.replaceAll(path.sep, "/")
    )) as {
      createServer: typeof ServerCreator
    }

    const { App } = await import(path.join(process.cwd(), "src", "App"))
    const server = await createServer(App)

    server.listen({ port }, function () {
      console.log(`Server is listening on port ${port}`)
      console.log("http://localhost:3000")
    })
  })
