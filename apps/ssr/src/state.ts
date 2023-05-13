import { Cinnabun, createSignal } from "cinnabun"
import { useRequestData } from "cinnabun/ssr"
import { GenericComponent } from "cinnabun/types"
import { parseJwt } from "./client/jwt.js"

const isClient = Cinnabun.isClient

const getUserDataFromToken = () => {
  const tkn = localStorage.getItem("token")
  if (!tkn) return null
  return parseJwt(tkn)
}

export const pathStore = createSignal(isClient ? window.location.pathname : "/")

export const userStore = createSignal<{ username: string } | null>(
  isClient ? getUserDataFromToken() : null
)

export const getUser = (self: GenericComponent) =>
  useRequestData<{ username: string } | null>(
    self,
    "data.user",
    userStore.value
  )

export const isAuthenticated = (self: GenericComponent) => !!getUser(self)
export const isNotAuthenticated = (self: GenericComponent) => !getUser(self)
