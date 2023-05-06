const esbuild = require("esbuild")

const {
  regexPatterns,
  replaceServerFunctions,
  generateFileRouter,
} = require("./transform.plugin")

/**
 * @type {esbuild.BuildOptions}
 */
export const sharedSettings = {
  bundle: true,
  //minify: true,
  format: "cjs",
  target: "esnext",
  tsconfig: "_tsconfig.json",
  jsx: "transform",
  jsxFactory: "Cinnabun.h",
  jsxFragment: "Cinnabun.fragment",
  jsxImportSource: "Cinnabun",
}

export const buildServer = async () =>
  esbuild.build({
    sourcemap: "linked",
    entryPoints: ["./src/App.tsx"],
    write: false,
    platform: "node",
    ...sharedSettings,
    plugins: [generateFileRouter()],
  })

export const buildClient = async () =>
  esbuild.build({
    entryPoints: ["./src/index.ts"],
    outdir: "dist/static",
    splitting: true,
    ...sharedSettings,
    format: "esm",
    plugins: [
      generateFileRouter(),
      replaceServerFunctions(regexPatterns.ServerPromise),
      replaceServerFunctions(regexPatterns.$fn),
    ],
  })
