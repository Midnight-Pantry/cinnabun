import { Cinnabun } from "cinnabun"
import { App } from "../App"
import { SSRProps } from "cinnabun/src/types"

if ("__cbData" in window) {
  Cinnabun.hydrate(App(), window.__cbData as SSRProps)
}
