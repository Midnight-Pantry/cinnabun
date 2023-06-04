import * as Cinnabun from "cinnabun"
import { handleLogout } from "../client/actions/auth"
import { isAuthenticated, isNotAuthenticated, userStore } from "../state"
import { toggleAuthModal, AuthModal } from "./AuthModal"
import { addNotification } from "./Notifications"
import { Portal } from "./Portal"

const onLogout = async () => {
  await handleLogout()
  addNotification({ text: "See ya next time 😢" })
}

export const AuthButtons = () => (
  <footer style="position:fixed;bottom:0;width:100vw;text-align:center;padding:.5rem;">
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
    <Portal>
      <AuthModal />
    </Portal>
  </footer>
)
