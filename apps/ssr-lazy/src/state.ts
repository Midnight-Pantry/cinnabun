import { Cinnabun, createSignal } from "cinnabun"

export const pathStore = createSignal(
  Cinnabun.isClient ? window.location.pathname : "/"
)
