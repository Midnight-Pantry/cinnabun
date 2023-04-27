import { userStore } from "../../state"
import { parseJwt } from "../jwt"

export interface LoginDTO {
  username: string
  password: string
}

export const handleLogin = async (dto: LoginDTO): Promise<boolean> => {
  if (userStore.value) return true
  try {
    const res = await fetch("/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error("failed to log in")

    const data = await res.json()
    const { username } = parseJwt(data.token)
    userStore.value = { username }
    localStorage.setItem("token", JSON.stringify(data.token))

    console.log("logged in", userStore.value)
    return true
  } catch (error) {
    userStore.value = null
    console.error(error)
    return false
  }
}

export const handleLogout = async () => {
  if (!userStore.value) return

  try {
    const res = await fetch("/logout", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({}),
    })
    if (!res.ok) throw new Error("failed to log out")

    userStore.value = null
    localStorage.removeItem("token")
    console.log("logged out")
    //TODO - implement programatic navigation
  } catch (error) {
    console.error(error)
  }
}
