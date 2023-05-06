import { Command, Option } from "commander"
import esbuild from "esbuild"
import { generateFileRouter, generateServer } from "../build/transform-plugin"

export default new Command("start")
  .description("start your cinnabun project")
  .addOption(new Option("-p, --port <port>", "port to run on").default("3000"))
  .addOption(
    new Option("-h, --host <host>", "host to run on").default("localhost")
  )
  .action(async ({ port }) => {
    // await Promise.all([buildServer(), buildClient()])

    /*


    
    
    export {default as App} from "./src/App.tsx"
          export * from "${__dirname}/../build/server.js"
          */
    const result = await esbuild.build({
      stdin: {
        contents: `
          import {App} from "./src/App"
          import {createServer} from "${__dirname}/../build/server.js"
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
