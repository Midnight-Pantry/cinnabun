import { Hydration } from "cinnabun/hydration"
import { App } from "../App"
import { Template } from "../Template"
import { SSRProps } from "cinnabun/src/types"
import "./index.css"

if ("__cbData" in window) {
  // streaming
  Hydration.hydrate(Template(App), window.__cbData as SSRProps)
}

// async function TestSerialization() {
//   const { html, componentTree } = await SSR.serverBake(App())
//   console.log(html, componentTree)
// }
