import { Cinnabun, createSignal } from "cinnabun"

const isClient = Cinnabun.isClient

export const pathStore = createSignal(isClient ? window.location.pathname : "/")
