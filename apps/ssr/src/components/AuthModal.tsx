import "./modal.css"
import "./tabs.css"
import * as Cinnabun from "cinnabun"
import { handleCreateAccount, handleLogin } from "../client/actions/auth"
import { NotificationType, addNotification } from "./Notifications"
import { FadeInOut, SlideInOut } from "cinnabun-transitions"
import { KeyboardListener, NavigationListener } from "cinnabun/listeners"

const authModalVisible = Cinnabun.createSignal(false)
let authModalToggler: HTMLElement | null = null

export const toggleAuthModal = () => {
  authModalVisible.value = !authModalVisible.value
  console.log("toggleAuthModal", authModalVisible.value)

  if (authModalVisible.value)
    authModalToggler = document.activeElement as HTMLElement

  if (!authModalVisible.value && authModalToggler)
    return authModalToggler.focus()
}

enum FormMode {
  LOGIN,
  CREATE,
}
export const AuthModal = () => {
  const formState = Cinnabun.createSignal({
    username: "",
    password: "",
  })
  const formMode = Cinnabun.createSignal(FormMode.LOGIN)

  const isFormInvalid = () => {
    return !formState.value.username || !formState.value.password
  }

  const resetForm = () => {
    formState.value = { username: "", password: "" }
  }

  const handleChange = (e: Event) => {
    const tgt = e.target as HTMLInputElement
    formState.value = {
      ...formState.value,
      [tgt.name]: tgt.value,
    }
  }
  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    e.stopPropagation()

    const res =
      formMode.value === FormMode.LOGIN
        ? await handleLogin(formState.value)
        : await handleCreateAccount(formState.value)

    if (!res) {
      const text =
        formMode.value === FormMode.LOGIN
          ? "Failed to log in 😢"
          : "Failed to create account 😢"
      addNotification({ text, type: NotificationType.ERROR })
      return
    }
    const text =
      formMode.value === FormMode.LOGIN ? "Welcome back! 😁" : "Welcome! 😁"
    addNotification({ text, type: NotificationType.SUCCESS })
    authModalVisible.value = false
  }

  return (
    <FadeInOut
      className="modal-outer"
      tabIndex={-1}
      watch={authModalVisible}
      bind:visible={() => authModalVisible.value}
      onmouseup={(e: MouseEvent) => {
        if (!authModalVisible.value) return
        const el = e.target as HTMLDivElement
        if (el.className === "modal-outer") toggleAuthModal()
      }}
    >
      <SlideInOut
        className="modal"
        settings={{ from: "bottom", duration: 300 }}
        properties={[{ name: "scale", from: 0, to: 1 }]}
        watch={authModalVisible}
        bind:visible={() => {
          if (!authModalVisible.value) resetForm()
          console.log("authModalVisible", authModalVisible.value)
          return authModalVisible.value
        }}
      >
        <NavigationListener
          onCapture={() => (authModalVisible.value = false)}
        />
        <KeyboardListener
          keys={["Escape"]}
          onCapture={() => toggleAuthModal()}
        />
        <form onsubmit={handleSubmit}>
          <div className="modal-header">
            <h2>Log in</h2>
          </div>
          <div className="modal-body">
            <div className="tab-list">
              <div
                watch={formMode}
                bind:className={() =>
                  `tab${formMode.value === FormMode.LOGIN ? " active" : ""}`
                }
              >
                <button
                  type="button"
                  onclick={() => (formMode.value = FormMode.LOGIN)}
                >
                  Log in
                </button>
              </div>
              <div
                watch={formMode}
                bind:className={() =>
                  `tab${formMode.value === FormMode.CREATE ? " active" : ""}`
                }
              >
                <button
                  type="button"
                  onclick={() => (formMode.value = FormMode.CREATE)}
                >
                  Create account
                </button>
              </div>
            </div>
            <input
              watch={formState}
              bind:value={() => formState.value.username}
              onkeyup={handleChange}
              type="text"
              name="username"
              placeholder="username"
              onMounted={(self) => self.element?.focus()}
            />

            <input
              watch={formState}
              bind:value={() => formState.value.password}
              onkeyup={handleChange}
              type="password"
              name="password"
              placeholder="password"
            />
          </div>
          <div className="modal-footer">
            <button watch={formState} bind:disabled={() => isFormInvalid()}>
              Submit
            </button>
          </div>
        </form>
      </SlideInOut>
    </FadeInOut>
  )
}
