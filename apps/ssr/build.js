const esbuild = require("esbuild")
const kill = require("tree-kill")
const { exec, ChildProcess } = require("node:child_process")
const EventEmitter = require("events")
const { regexPatterns, replaceServerFunctions } = require("./transform.plugin")

const watch = process.argv.find((arg) => ["-W", "--watch"].indexOf(arg) > -1)

let [clientBuilt, serverBuilt] = [false, false]

/** @type {ChildProcess | null} */
let serverProcess = null

const startServer = () => {
  if (serverProcess && serverProcess.pid) {
    kill(serverProcess.pid, () => {
      serverProcess = exec("node dist/server")
      console.log("server started")
    })
    return
  }
  serverProcess = exec("node dist/server")
  console.log("server started")
}

const emitter = new EventEmitter()
emitter.on("build-finished", () => {
  if (!clientBuilt || !serverBuilt) return
  clientBuilt = false
  serverBuilt = false

  console.log("build finished")
  if (watch) startServer()
})

/** @type {esbuild.BuildOptions} */
const sharedSettings = {
  bundle: true,
  minify: true,
  format: "cjs",
  target: "esnext",
  tsconfig: "_tsconfig.json",
  jsx: "transform",
  jsxFactory: "Cinnabun.h",
  jsxFragment: "Cinnabun.fragment",
  jsxImportSource: "Cinnabun",
}

const build = async () => {
  const serverCtx = await esbuild.context({
    sourcemap: "linked",
    entryPoints: ["./src/server/index.ts"],
    outdir: "dist/server",
    platform: "node",
    ...sharedSettings,
    plugins: [
      {
        name: "build-started",
        setup({ onStart }) {
          onStart(() => {
            console.log("build started")
          })
        },
      },
      {
        name: "build-finished",
        setup({ onEnd }) {
          onEnd(() => {
            serverBuilt = true
            emitter.emit("build-finished")
          })
        },
      },
    ],
  })
  if (watch) {
    await serverCtx.watch()
  } else {
    await serverCtx.dispose()
  }

  const ctx = await esbuild.context({
    sourcemap: "linked",
    entryPoints: ["./src/client/index.ts"],
    outdir: "dist/static",
    ...sharedSettings,
    plugins: [
      replaceServerFunctions(regexPatterns.ServerPromise),
      replaceServerFunctions(regexPatterns.$fn),
      {
        name: "build-finished",
        setup({ onEnd }) {
          onEnd(() => {
            clientBuilt = true
            emitter.emit("build-finished")
          })
        },
      },
    ],
  })
  if (watch) {
    await ctx.watch()
  } else {
    await ctx.dispose()
  }
}

build()
