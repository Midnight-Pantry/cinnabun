import { Cinnabun, createSignal, Component } from "cinnabun"
import { useRequestData } from "cinnabun/ssr"
import { parseJwt } from "./client/jwt"

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

export const getUser = (self: Component) =>
  useRequestData<{ username: string } | null>(
    self,
    "data.user",
    userStore.value
  )

export const isAuthenticated = (self: Component) => !!getUser(self)
export const isNotAuthenticated = (self: Component) => !getUser(self)
