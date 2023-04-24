const esbuild = require("esbuild")

const { regexPatterns, replaceServerFunctions } = require("./transform.plugin")

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

Promise.all([
  esbuild.build({
    sourcemap: "linked",
    entryPoints: ["./src/server/index.ts"],
    outdir: "dist/server",
    platform: "node",
    ...sharedSettings,
  }),
  esbuild.build({
    sourcemap: "linked",
    entryPoints: ["./src/client/index.ts"],
    outdir: "dist/static",
    ...sharedSettings,
    plugins: [
      replaceServerFunctions(regexPatterns.ServerPromise),
      replaceServerFunctions(regexPatterns.$fn),
    ],
  }),
])
  .then(() => {
    console.log("build complete.")
  })
  .catch((error) => {
    console.error("build failed: ", error)
    process.exit(1)
  })
