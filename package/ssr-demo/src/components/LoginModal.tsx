import * as Cinnabun from "cinnabun"
import "./modal.css"
import { handleLogin } from "../client/actions/auth"

export const loginVisible = Cinnabun.createSignal(false)

export const toggleLoginForm = () => (loginVisible.value = !loginVisible.value)

export const LoginForm = () => {
  const formState = Cinnabun.createSignal({
    username: "",
    password: "",
  })

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
  const handleSubmit = async () => {
    const res = await handleLogin(formState.value)
    if (res) loginVisible.value = false
  }

  return (
    <>
      <div
        className="modal-outer"
        tabIndex={-1}
        watch={loginVisible}
        bind:render={() => {
          if (!loginVisible.value) resetForm()
          return loginVisible.value
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).className === "modal-outer") {
            loginVisible.value = !loginVisible.value
          }
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>Log in</h2>
          </div>
          <div className="modal-body">
            <form
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <input
                watch={formState}
                bind:value={() => formState.value.username}
                onChange={handleChange}
                type="text"
                name="username"
                placeholder="username"
              />
              <input
                watch={formState}
                bind:value={() => formState.value.password}
                onChange={handleChange}
                type="password"
                name="password"
                placeholder="password"
              />
            </form>
          </div>
          <div className="modal-footer">
            <button
              watch={formState}
              bind:disabled={() => isFormInvalid()}
              type="button"
              onClick={() => handleSubmit()}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
