import * as Cinnabun from "cinnabun"
import { handleCreateAccount, handleLogin } from "../client/actions/auth"
import { NotificationType, addNotification } from "./Notifications"
import "./modal.css"
import "./tabs.css"

export const authModalVisible = Cinnabun.createSignal(false)

enum FormMode {
  LOGIN,
  CREATE,
}

export const toggleAuthModal = () =>
  (authModalVisible.value = !authModalVisible.value)

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
    <div
      className="modal-outer"
      tabIndex={-1}
      watch={authModalVisible}
      bind:render={() => {
        if (!authModalVisible.value) resetForm()
        return authModalVisible.value
      }}
      onmouseup={(e: MouseEvent) => {
        if ((e.target as HTMLElement).className === "modal-outer") {
          toggleAuthModal()
        }
      }}
    >
      <form className="modal" onsubmit={handleSubmit}>
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
    </div>
  )
}
