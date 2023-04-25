import * as Cinnabun from "cinnabun"
import { handleLogout } from "../client/actions/auth"
import { isAuthenticated, isNotAuthenticated, userStore } from "../state"
import { toggleLoginForm, LoginForm } from "./LoginModal"

export const AuthButtons = () => {
  return (
    <>
      <button
        onClick={toggleLoginForm}
        watch={userStore}
        bind:render={isNotAuthenticated}
      >
        Log in
      </button>
      <button
        onClick={handleLogout}
        watch={userStore}
        bind:render={isAuthenticated}
      >
        Log out
      </button>
      <LoginForm />
    </>
  )
}
