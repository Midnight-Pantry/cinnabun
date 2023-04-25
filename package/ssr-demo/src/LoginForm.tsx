import * as Cinnabun from "cinnabun"
import { userStore } from "./state"

export const LoginForm = () => {
  const state = Cinnabun.createSignal({
    username: "",
    password: "",
  })

  const handleChange = (e: Event) => {
    const tgt = e.target as HTMLInputElement
    state.value = {
      ...state.value,
      [tgt.name]: tgt.value,
    }
  }
  const handleSubmit = async () => {
    try {
      const res = await fetch("/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.value),
      })
      if (!res.ok) throw new Error("Failed to log in")
      const data = await res.json()
      userStore.value = data
      console.log("logged in", data)
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <form>
      <input
        watch={state}
        bind:value={() => state.value.username}
        onChange={handleChange}
        type="text"
        id="username"
        name="username"
      />
      <input
        watch={state}
        bind:value={() => state.value.password}
        onChange={handleChange}
        type="password"
        id="password"
        name="password"
      />
      <button type="button" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  )
}
