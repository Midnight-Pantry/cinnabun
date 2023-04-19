const esbuild = require("esbuild")

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

esbuild
  .build({
    sourcemap: "linked",
    entryPoints: ["./src/server/index.ts"],
    outdir: "dist/server",
    platform: "node",
    ...sharedSettings,
  })
  .then(() =>
    esbuild.build({
      sourcemap: "linked",
      entryPoints: ["./src/client/index.ts"],
      outdir: "dist/public",
      ...sharedSettings,
    })
  )
  .then(() => {
    console.log("build complete.")
  })
  .catch((error) => {
    console.error("build failed: ", error)
    process.exit(1)
  })
