import { defineConfig } from "vite"

export default defineConfig({
  esbuild: {
    jsx: "transform",
    //jsxInject: "import * as Cinnabun from 'cinnabun'",
    jsxFactory: "Cinnabun.h",
    jsxFragment: "Cinnabun.fragment",
  },
})
