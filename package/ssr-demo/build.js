const esbuild = require("esbuild")

esbuild
  .build({
    sourcemap: "linked",
    entryPoints: ["./src/index.ts"],
    outdir: "dist",
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
  .catch((error) => {
    console.error("build failed", error)
    process.exit(1)
  })
  .then(() => {
    console.log("build complete.")
  })
