import { SSR } from "cinnabun/ssr"
import { App } from "../App"
import { SSRProps } from "cinnabun/src/types"
import "./index.css"

if ("__cbData" in window) {
  SSR.hydrate(App(), window.__cbData as SSRProps)
  //TestSerialization()
}

// async function TestSerialization() {
//   const { html, componentTree } = await SSR.serverBake(App())
//   console.log(html, componentTree)
// }
