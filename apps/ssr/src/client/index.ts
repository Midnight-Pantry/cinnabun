import { Hydration } from "cinnabun/hydration"
import { App } from "../App"
import { SSRProps } from "cinnabun/src/types"
import "./index.css"
import { createLiveSocket } from "./liveSocket"
import { Cinnabun } from "cinnabun"

if ("__cbData" in window) {
  Cinnabun.registerRuntimeServices(createLiveSocket())
  Hydration.hydrate(App(), window.__cbData as SSRProps)
  //TestSerialization()
}

// async function TestSerialization() {
//   const { html, componentTree } = await SSR.serverBake(App())
//   console.log(html, componentTree)
// }
