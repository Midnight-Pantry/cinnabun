import * as Cinnabun from "cinnabun"
import { handleLogout } from "../actions/auth"
import { isAuthenticated, isNotAuthenticated, userStore } from "../state"
import { loginVisible, LoginForm } from "./LoginModal"

export const AuthButtons = () => {
  return (
    <div>
      <button
        onClick={() => (loginVisible.value = !loginVisible.value)}
        watch={userStore}
        bind:render={isNotAuthenticated}
      >
        Log in
      </button>
      <button
        onClick={() => handleLogout()}
        watch={userStore}
        bind:render={isAuthenticated}
      >
        Log out
      </button>
      <LoginForm />
    </div>
  )
}
