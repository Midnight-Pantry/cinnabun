import "./index.css"
import { Cinnabun } from "cinnabun"
import { Hydration } from "cinnabun/hydration"
import { SSRProps } from "cinnabun/types"
import { App } from "../App.jsx"
import { Template } from "../Template.jsx"
import { createLiveSocket } from "./liveSocket.js"

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
