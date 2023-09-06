import fs from "node:fs"
import path from "node:path"
import { globSync } from "glob"
import esbuild from "esbuild"
import kill from "tree-kill"
import { log, fmt } from "./logger.js"
import { SSG } from "cinnabun/dist/ssg.js"

import { exec, ChildProcess } from "node:child_process"
import EventEmitter from "events"

function getArgs() {
  return {
    prod: !!process.argv.find((arg) => arg === "--prod"),
    debug: !!process.argv.find((arg) => arg === "--debug"),
    watch: !!process.argv.find((arg) => arg === "--watch"),
  }
}
const { prod, debug, watch } = getArgs()
console.log({ prod, debug, watch })

const envVars = {
  "process.env.NODE_ENV": prod ? '"production"' : '"development"',
  "process.env.DEBUG": debug ? "true" : "false",
}

/** @type {ChildProcess | null} */
let serverProcess = null

const restartServer = () => {
  if (serverProcess && serverProcess.pid) {
    kill(serverProcess.pid, () => {
      startServer()
    })
    return
  }
  startServer()
}

const startServer = () => {
  serverProcess = exec("node .cb/server")
  serverProcess.stdout.on("data", (data) => {
    process.stdout.write(data)
  })
  serverProcess.stderr.on("data", (data) => {
    process.stderr.write(data)
  })
  serverProcess.on("close", (code) => {
    if (code && code === 96) {
      log("Bold", "serverProcess exited, awaiting changes...")
    }
  })
}

const emitter = new EventEmitter()
emitter.on("build-finished", () => {
  log("FgBlue", "build finished")
  SSG.staticBake()
  if (watch) restartServer()
})

/** @type {esbuild.BuildOptions} */
const sharedSettings = {
  bundle: true,
  minify: false,
  format: "esm",
  target: "esnext",
  tsconfig: ".cb/_tsconfig.json",
  jsx: "transform",
  jsxFactory: "Cinnabun.h",
  jsxFragment: "Cinnabun.fragment",
  jsxImportSource: "Cinnabun",
  sourcemap: "linked",
  splitting: false,
  define: { ...envVars },
  metafile: watch,
  plugins: [
    {
      name: "cleanup",
      async setup(build) {
        const options = build.initialOptions
        if (!options.metafile) {
          console.log(
            "[esbuild cleanup] Metafile is not enabled - skipping the cleanup"
          )
          return
        }

        const safelistSet = new Set([])
        build.onEnd((result) => {
          if (typeof result.metafile.outputs !== "undefined") {
            return
          }
          Object.keys(result.metafile.outputs).forEach((path) =>
            safelistSet.add(path)
          )
          const fPath = path.join(options.outdir, "*").replace(/\\/g, "/")
          const files = globSync(fPath)
          files.forEach((f) => {
            if (!safelistSet.has(f.replace(/\\/g, "/"))) fs.unlinkSync(f)
          })
        })
      },
    },
  ],
}

// read the src/pages directory and add each file as an entry point
const pages = globSync("./src/pages/**/*.tsx", { nodir: true }).map((p) =>
  p.replace(/\\/g, "/")
)

const serverCfg = {
  entryPoints: ["./src/App.tsx", ...pages],
  outdir: "dist",
  platform: "node",
  ...sharedSettings,
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
  plugins: [
    ...sharedSettings.plugins,
    {
      name: "build-evts",
      setup({ onStart, onEnd }) {
        onStart(() => {
          console.time(fmt("Dim", "build time"))
        })
        onEnd(() => {
          console.timeEnd(fmt("Dim", "build time"))
          emitter.emit("build-finished")
        })
      },
    },
  ],
}

const build = async () => {
  log("FgBlue", "building...")
  if (watch) {
    esbuild.context(serverCfg).then((ctx) => {
      ctx.watch()
    })
  } else {
    await esbuild.build(serverCfg)
  }
}

build()
