import { Hydration } from "cinnabun/hydration"
import { App } from "../App"
import { Template } from "../Template"
import { SSRProps } from "cinnabun/src/types"
import "./index.css"
import { createLiveSocket } from "./liveSocket"
import { Cinnabun } from "cinnabun"

const env = process.env.NODE_ENV ?? "development"

if ("__cbData" in window) {
  Cinnabun.registerRuntimeServices(createLiveSocket())
  try {
    Hydration.hydrate(Template(App), window.__cbData as SSRProps)
  } catch (error) {
    console.error(error)
  }

  if (env === "development") {
    const evtHandler = new EventSource("/sse")
    let didConnect = false
    evtHandler.addEventListener("handshake", () => {
      didConnect = true
    })

    evtHandler.addEventListener("error", (evt: Event) => {
      const connIsReset = didConnect && evtHandler.readyState === 0
      if (connIsReset) location.reload()
      console.log("evtHandler err evt", evt)
    })
  }

  //TestSerialization()
}

// async function TestSerialization() {
//   const { html, componentTree } = await SSR.serverBake(App())
//   console.log(html, componentTree)
// }
