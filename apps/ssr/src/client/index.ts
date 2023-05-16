import "./index.css"
import { Cinnabun } from "cinnabun"
import { Hydration } from "cinnabun/hydration"
import { SSRProps } from "cinnabun/types"
import { App } from "../App.jsx"
import { Template } from "../Template.jsx"
import { createLiveSocket } from "./liveSocket.js"
import { SSR } from "cinnabun/ssr"

if ("__cbData" in window) {
  Cinnabun.registerRuntimeServices(createLiveSocket())
  // streaming
  Hydration.hydrate(Template(App), window.__cbData as SSRProps)
  // non-streaming
  //Hydration.hydrate(App(), window.__cbData as SSRProps)

  //TestSerialization()
}

async function TestSerialization() {
  const cinnabunInstance = new Cinnabun()
  Object.assign(cinnabunInstance, { isClient: false })
  const { html, componentTree } = await SSR.serverBake(App(), {
    cinnabunInstance,
  })
  console.log(html, componentTree)
}
