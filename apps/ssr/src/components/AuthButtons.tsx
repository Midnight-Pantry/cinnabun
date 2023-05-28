import * as Cinnabun from "cinnabun"
import { handleLogout } from "../client/actions/auth"
import { isAuthenticated, isNotAuthenticated, userStore } from "../state"
import { toggleAuthModal, AuthModal } from "./AuthModal"
import { addNotification } from "./Notifications"

const onLogout = async () => {
  await handleLogout()
  addNotification({ text: "See ya next time 😢" })
}

export const AuthButtons = () => (
  <>
    <button
      onclick={toggleAuthModal}
      watch={userStore}
      bind:render={isNotAuthenticated}
    >
      Log in
    </button>
    <button onclick={onLogout} watch={userStore} bind:render={isAuthenticated}>
      Log out
    </button>
    <AuthModal />
  </>
)
