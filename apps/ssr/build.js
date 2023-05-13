import esbuild from "esbuild"

import { regexPatterns, replaceServerFunctions } from "./transform.plugin.js"

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
    format: "iife",
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
