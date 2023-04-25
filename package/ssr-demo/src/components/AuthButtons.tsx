import * as Cinnabun from "cinnabun"
import { Cinnabun as cb } from "cinnabun"
import { handleLogout } from "../actions/auth"
import { userStore } from "../state"
import { loginVisible, LoginForm } from "./LoginModal"
import { GenericComponent } from "cinnabun/types"

export const AuthButtons = () => {
  return (
    <section>
      <button
        onClick={() => (loginVisible.value = !loginVisible.value)}
        watch={userStore}
        bind:render={(self: GenericComponent) =>
          cb.isClient
            ? !userStore.value
            : !self.cbInstance?.serverRequest.data.user
        }
      >
        Log in
      </button>
      <button
        onClick={() => handleLogout()}
        watch={userStore}
        bind:render={(self: GenericComponent) =>
          cb.isClient
            ? !!userStore.value
            : !!self.cbInstance?.serverRequest.data.user
        }
      >
        Log out
      </button>
      <LoginForm />
    </section>
  )
}
