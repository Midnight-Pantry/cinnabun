import { defineConfig } from "vite"
import esBuildSettings from "cinnabun/settings.esbuild"

const { jsxInject, jsxFactory, jsxFragment } = esBuildSettings

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxInject,
    jsxFactory,
    jsxFragment,
  },
})
