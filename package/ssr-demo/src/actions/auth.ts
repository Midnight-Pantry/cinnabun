import { userStore } from "../state"

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
    userStore.value = data
    console.log("logged in", data)
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
    console.log("logged out")
    //TODO - implement programatic navigation
  } catch (error) {
    console.error(error)
  }
}
