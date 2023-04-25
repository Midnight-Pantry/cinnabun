import { Cinnabun, createSignal } from "cinnabun"
import { getCookie } from "cinnabun/utils"

const isClient = Cinnabun.isClient

export const pathStore = createSignal(isClient ? window.location.pathname : "/")

export const userStore = createSignal<{ username: string } | null>(
  isClient ? getCookie("user") : ""
)
if (isClient) {
  console.log("user", userStore.value)
}
