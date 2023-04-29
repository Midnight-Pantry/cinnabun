import { Cinnabun, createSignal } from "cinnabun"
import { useRequestData } from "cinnabun/ssr"
import { GenericComponent } from "cinnabun/types"
import { parseJwt } from "./client/jwt"

const isClient = Cinnabun.isClient

const getUserData = () => {
  const tkn = localStorage.getItem("token")
  if (!tkn) return null
  return parseJwt(tkn)
}

export const pathStore = createSignal(isClient ? window.location.pathname : "/")

export const userStore = createSignal<{ username: string } | null>(
  isClient ? getUserData() : null
)

export const isAuthenticated = (self: GenericComponent) =>
  useRequestData<boolean>(self, "data.user", !!userStore.value)

export const isNotAuthenticated = (self: GenericComponent) =>
  !isAuthenticated(self)
