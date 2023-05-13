import * as Cinnabun from "cinnabun"
import { createChatMessage } from "../../client/actions/chat.js"
import { userStore } from "../../state.js"
import { toggleAuthModal } from "../AuthModal.jsx"
import { isAuthenticated } from "../../state.js"
import { isNotAuthenticated } from "../../state.js"

export const ChatForm = () => {
  const inputState = Cinnabun.createSignal("")

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    e.stopPropagation()
    const res = await createChatMessage(inputState.value)
    if (res) inputState.value = ""
  }

  return (
    <form
      onsubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <input
        value={inputState}
        onkeyup={(e: Event) => {
          inputState.value = (e.target as HTMLInputElement).value
        }}
      />

      <button
        watch={[inputState, userStore]}
        bind:render={isAuthenticated}
        bind:disabled={() => !inputState.value}
        onclick={handleSubmit}
      >
        Submit
      </button>

      <button
        watch={[userStore]}
        bind:render={isNotAuthenticated}
        onclick={toggleAuthModal}
      >
        Log in to chat
      </button>
    </form>
  )
}
