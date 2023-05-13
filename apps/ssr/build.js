import esbuild from "esbuild"

import { regexPatterns, replaceServerFunctions } from "./transform.plugin.js"

/**
 * @type {esbuild.BuildOptions}
 */
const sharedSettings = {
  bundle: true,
  minify: true,
  format: "esm",
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
    banner: {
      js: `
      import path from 'path';
      import { fileURLToPath } from 'url';
      import { createRequire as topLevelCreateRequire } from 'module';
      const require = topLevelCreateRequire(import.meta.url);
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      `,
    },
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
