import { defineConfig } from "vite"

export default defineConfig({
  esbuild: {
    jsx: "transform",
    //jsxInject: "import * as Cinnabun from 'cinnabun'", // disabled until we can standardize this feature
    jsxFactory: "Cinnabun.h",
    jsxFragment: "Cinnabun.fragment",
  },
})
