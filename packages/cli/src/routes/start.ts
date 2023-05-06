import { Command, Option } from "commander"
import esbuild from "esbuild"
import { generateFileRouter } from "../build/transform-plugin"
import path from "path"

export default new Command("start")
  .description("start your cinnabun project")
  .addOption(new Option("-p, --port <port>", "port to run on").default("3000"))
  .addOption(
    new Option("-h, --host <host>", "host to run on").default("localhost")
  )
  .action(async ({ port }) => {
    const result = await esbuild.build({
      stdin: {
        contents: `
          import {App} from "./src/App"
          import {createServer} from "${path
            .join(__dirname, "..", "build", "server.js")
            .replaceAll(path.sep, "/")}"
          (() => ({
            App,
            createServer
          }))()
         
        `,
        resolveDir: process.cwd(),
      },
      platform: "node",
      bundle: true,
      write: false,
      format: "cjs",
      target: "esnext",
      tsconfig: "_tsconfig.json",
      jsx: "transform",
      jsxFactory: "Cinnabun.h",
      jsxFragment: "Cinnabun.fragment",
      jsxImportSource: "Cinnabun",
      plugins: [generateFileRouter()],
    })

    const { App, createServer } = eval(result.outputFiles![0].text) as any

    createServer(App).listen({ port }, function (err: any) {
      if (err) {
        console.error(err)
        process.exit(1)
      }

      console.log(`Server is listening on port ${port}`)
      console.log("http://localhost:3000")
    })
  })
