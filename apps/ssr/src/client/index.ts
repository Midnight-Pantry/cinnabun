import { Hydration } from "cinnabun/hydration"
import { App } from "../App"
import { Template } from "../Template"
import { SSRProps } from "cinnabun/src/types"
import "./index.css"
import { createLiveSocket } from "./liveSocket"
import { Cinnabun } from "cinnabun"

if ("__cbData" in window) {
  Cinnabun.registerRuntimeServices(createLiveSocket())
  // streaming
  Hydration.hydrate(Template(App), window.__cbData as SSRProps)
  // non-streaming
  //Hydration.hydrate(App(), window.__cbData as SSRProps)

  //TestSerialization()
}

// async function TestSerialization() {
//   const { html, componentTree } = await SSR.serverBake(App())
//   console.log(html, componentTree)
// }
