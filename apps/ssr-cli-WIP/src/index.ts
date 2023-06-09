import { Hydration } from "cinnabun/hydration"
import { App } from "./App"
import { SSRProps } from "cinnabun/src/types"
import "./index.css"

if ("__cbData" in window) {
  // streaming
  Hydration.hydrate(App(), window.__cbData as SSRProps)
}

// async function TestSerialization() {
//   const { html, componentTree } = await SSR.serverBake(App())
//   console.log(html, componentTree)
// }
