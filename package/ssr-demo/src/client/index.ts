import { Cinnabun } from "cinnabun"
import { App } from "../App"
import { SSRProps } from "cinnabun/src/types"
import "./index.css"

if ("__cbData" in window) {
  Cinnabun.hydrate(App(), window.__cbData as SSRProps)
  //const { html, componentTree } = Cinnabun.serverBake(App())
  //console.log(html, componentTree)
}
