const esbuild = require("esbuild")
const { prebuild } = require("./src/helpers.js")

const sharedSettings = {
  bundle: true,
  //minify: true,
  format: "cjs",
  target: "esnext",
  tsconfig: "_tsconfig.json",
  jsx: "transform",
  jsxFactory: "Cinnabun.h",
  jsxFragment: "Cinnabun.fragment",
  jsxImportSource: "Cinnabun",
  external: ["esbuild"],
}

prebuild("./app").then(() => {
  esbuild
    .build({
      sourcemap: "linked",
      entryPoints: ["./src/index.ts"],
      outdir: ".cb/dist/server",
      platform: "node",
      ...sharedSettings,
    })
    .then(() => {
      console.log("build complete.")
    })
    .catch((error) => {
      console.error("build failed: ", error)
      process.exit(1)
    })
})
