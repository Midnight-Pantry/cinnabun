const esbuild = require("esbuild")

const { regexPatterns, replaceServerFunctions } = require("./transform.plugin")

const { prebuild } = require("./prebuild")
const { postbuild } = require("./postbuild")

/**
 * @type {esbuild.BuildOptions}
 */
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
  jsxSideEffects: true,
  inject: ["Cinnabun"],
}

prebuild().then(() => {
  Promise.all([
    esbuild.build({
      sourcemap: "linked",
      entryPoints: ["./.cb/src/server/index.ts"],
      outdir: "dist/server",
      platform: "node",
      ...sharedSettings,
    }),
    esbuild.build({
      sourcemap: "linked",
      entryPoints: ["./.cb/src/client/index.ts"],
      outdir: "dist/static",
      splitting: true,
      ...sharedSettings,
      format: "esm",
      plugins: [
        replaceServerFunctions(regexPatterns.ServerPromise),
        replaceServerFunctions(regexPatterns.$fn),
      ],
    }),
  ])
    .then(() => {
      console.log("build complete.")
      postbuild()
    })
    .catch((error) => {
      console.error("build failed: ", error)
      process.exit(1)
    })
})
