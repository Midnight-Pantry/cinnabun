import { Cinnabun } from "cinnabun"
import { SSRProps } from "cinnabun/src/types"

if ("__cbData" in window) {
  const { tree, root } = window.__cbData as SSRProps
  Cinnabun.hydrate(tree, root)
}
