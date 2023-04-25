import { Cinnabun, createSignal } from "cinnabun"
import { useRequestData } from "cinnabun/ssr"
import { GenericComponent } from "cinnabun/types"
import { getCookie } from "cinnabun/utils"

const isClient = Cinnabun.isClient

export const pathStore = createSignal(isClient ? window.location.pathname : "/")

export const userStore = createSignal<{ username: string } | null>(
  isClient ? getCookie("user") : null
)

export const isAuthenticated = (self: GenericComponent) =>
  useRequestData<boolean>(self, "data.user", !!userStore.value)

export const isNotAuthenticated = (self: GenericComponent) =>
  !isAuthenticated(self)
