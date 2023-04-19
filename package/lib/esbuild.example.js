import esbuild from "esbuild"
import esBuildSettings from "./settings.esbuild.js"
const { jsx, jsxFactory, jsxFragment } = esBuildSettings

esbuild
  .build({
    sourcemap: "linked",
    entryPoints: ["./src/index.ts"],
    jsx,
    jsxFactory,
    jsxFragment,
    jsxImportSource: "import * as Cinnabun from '@/'",
    outdir: "src/dist",
    bundle: true,
    minify: true,
  })
  .catch((error) => {
    console.error("build failed", error)
    process.exit(1)
  })
  .then(() => {
    console.log("build complete.")
  })
