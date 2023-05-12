import { createSignal } from "cinnabun"

export const pathStore = createSignal(window.location.hash)
