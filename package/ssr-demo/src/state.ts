import { createSignal } from "cinnabun"

export const pathStore = createSignal(
  "window" in globalThis ? window.location.pathname : "/"
)
