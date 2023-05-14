import { Hydration } from "cinnabun/hydration"
import { App } from "./App.jsx"
import { SSRProps } from "cinnabun/types"
import "./index.css"

if ("__cbData" in window) {
  // streaming
  Hydration.hydrate(App(), window.__cbData as SSRProps)
}

// async function TestSerialization() {
//   const { html, componentTree } = await SSR.serverBake(App())
//   console.log(html, componentTree)
// }
