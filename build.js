import esbuild from "esbuild"

esbuild
  .build({
    sourcemap: "linked",
    entryPoints: ["./src/index.ts"],
    jsx: "transform",
    jsxFactory: "Cinnabon.h",
    jsxFragment: "Cinnabon.fragment",
    jsxImportSource: "import * as Cinnabon from '@/'",
    outdir: "src/dist",
    bundle: true,
  })
  .catch(() => {
    console.log("err")
    process.exit(1)
  })
  .then(() => {
    console.log("built")
  })
