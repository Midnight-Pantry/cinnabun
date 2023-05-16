import * as Cinnabun from "cinnabun"
import { handleLogout } from "../client/actions/auth"
import { isAuthenticated, isNotAuthenticated, userStore } from "../state"
import { toggleAuthModal, AuthModal } from "./AuthModal"
import { addNotification } from "./Notifications"

export const AuthButtons = () => {
  const onLogout = async () => {
    await handleLogout()
    addNotification({ text: "See ya next time 😢" })
  }
  return (
    <>
      <button
        onclick={toggleAuthModal}
        watch={userStore}
        bind:render={isNotAuthenticated}
      >
        Log in
      </button>
      <button
        onclick={onLogout}
        watch={userStore}
        bind:render={isAuthenticated}
      >
        Log out
      </button>
      <AuthModal />
    </>
  )
}
