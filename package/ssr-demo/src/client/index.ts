import { Cinnabun } from "cinnabun"
import { App } from "../App"
import { SSRProps } from "cinnabun/src/types"
import "./public/style.css"
if ("__cbData" in window) {
  console.log("Asdasd")
  Cinnabun.hydrate(App(), window.__cbData as SSRProps)
}
