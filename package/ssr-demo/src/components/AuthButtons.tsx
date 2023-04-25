import * as Cinnabun from "cinnabun"
import { handleLogout } from "../actions/auth"
import { userStore } from "../state"
import { loginVisible, LoginForm } from "./LoginModal"

export const AuthButtons = () => {
  return (
    <section>
      <button
        onClick={() => (loginVisible.value = !loginVisible.value)}
        watch={userStore}
        bind:render={() => !userStore.value}
      >
        Log in
      </button>
      <button
        onClick={() => handleLogout()}
        watch={userStore}
        bind:render={() => !!userStore.value}
      >
        Log out
      </button>
      <LoginForm />
    </section>
  )
}
