const esbuild = require("esbuild")
const kill = require("tree-kill")
const { log, fmt } = require("./logger.js")

const { exec, ChildProcess } = require("node:child_process")
const EventEmitter = require("events")
const {
  regexPatterns,
  replaceServerFunctions,
} = require("./transform.plugin.js")

function getArgs() {
  return {
    prod: !!process.argv.find((arg) => arg === "--prod"),
    debug: !!process.argv.find((arg) => arg === "--debug"),
  }
}
const { prod, debug } = getArgs()

const envVars = {
  "process.env.NODE_ENV": prod ? '"production"' : '"development"',
  "process.env.DEBUG": debug ? "true" : "false",
}

let [clientBuilt, serverBuilt] = [false, false]

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
  serverProcess = exec("node dist/server")
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
  if (!clientBuilt || !serverBuilt) return

  log("FgBlue", "build finished")
  if (!prod) restartServer()
})

/** @type {esbuild.BuildOptions} */
const sharedSettings = {
  bundle: true,
  minify: true,
  format: "cjs",
  target: "esnext",
  tsconfig: ".cb/_tsconfig.json",
  jsx: "transform",
  jsxFactory: "Cinnabun.h",
  jsxFragment: "Cinnabun.fragment",
  jsxImportSource: "Cinnabun",
  sourcemap: "linked",
  define: { ...envVars },
}

const clientCfg = {
  entryPoints: ["./src/client/index.ts"],
  outdir: "dist/static",
  ...sharedSettings,
  format: "iife",
  plugins: [
    replaceServerFunctions(regexPatterns.ServerPromise),
    replaceServerFunctions(regexPatterns.$fn),
    {
      name: "build-evts",
      setup({ onStart, onEnd }) {
        onStart(() => {
          clientBuilt = false
          serverBuilt = false
          console.time(fmt("Dim", "client build time"))
        })
        onEnd(() => {
          clientBuilt = true
          console.timeEnd(fmt("Dim", "client build time"))
          emitter.emit("build-finished")
        })
      },
    },
  ],
}

const serverCfg = {
  entryPoints: ["./src/server/index.ts"],
  outdir: "dist/server",
  platform: "node",
  ...sharedSettings,
  plugins: [
    {
      name: "build-evts",
      setup({ onStart, onEnd }) {
        onStart(() => {
          serverBuilt = false
          console.time(fmt("Dim", "server build time"))
        })
        onEnd(() => {
          serverBuilt = true
          console.timeEnd(fmt("Dim", "server build time"))
          emitter.emit("build-finished")
        })
      },
    },
  ],
}

const build = async () => {
  log("FgBlue", "building...")
  if (prod) {
    await Promise.all([esbuild.build(clientCfg), esbuild.build(serverCfg)])
  } else {
    esbuild.context(clientCfg).then((ctx) => {
      ctx.watch()
    })
    esbuild.context(serverCfg).then((ctx) => {
      ctx.watch()
    })
  }
}

build()
