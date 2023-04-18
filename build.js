import esbuild from "esbuild"
import { BuildSettings } from "./src"
const { jsx, jsxFactory, jsxFragment } = BuildSettings.esbuild

esbuild
  .build({
    sourcemap: "linked",
    entryPoints: ["./src/index.ts"],
    jsx,
    jsxFactory,
    jsxFragment,
    jsxImportSource: "import * as Cinnabon from '@/'",
    outdir: "src/dist",
    bundle: true,
  })
  .catch((error) => {
    console.error("build failed", error)
    process.exit(1)
  })
  .then(() => {
    console.log("build complete.")
  })
