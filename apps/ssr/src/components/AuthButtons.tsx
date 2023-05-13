import * as Cinnabun from "cinnabun"
import { handleLogout } from "../client/actions/auth.js"
import { isAuthenticated, isNotAuthenticated, userStore } from "../state.js"
import { toggleAuthModal, AuthModal } from "./AuthModal.jsx"
import { addNotification } from "./Notifications.jsx"

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
