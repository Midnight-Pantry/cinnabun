const esbuild = require("esbuild")

esbuild
  .build({
    sourcemap: "linked",
    entryPoints: ["./src/server/index.ts"],
    outdir: "dist/server",
    bundle: true,
    minify: true,
    platform: "node",
    format: "cjs",
    target: "esnext",
    tsconfig: "_tsconfig.json",
    jsx: "transform",
    jsxFactory: "Cinnabun.h",
    jsxFragment: "Cinnabun.fragment",
    jsxImportSource: "Cinnabun",
  })
  .then(() => {
    console.log("build complete.")
  })
  .catch((error) => {
    console.error("build failed: ", error)
    process.exit(1)
  })
