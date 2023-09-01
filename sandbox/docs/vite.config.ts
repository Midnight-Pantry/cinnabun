import { defineConfig } from "vite"

export default defineConfig({
  esbuild: {
    jsx: "transform",
    jsxFactory: "Cinnabun.h",
    jsxFragment: "Cinnabun.fragment",
  },
  build: {
    outDir: "../../docs",
  },
})
