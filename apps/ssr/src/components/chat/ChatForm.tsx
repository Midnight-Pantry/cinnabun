import * as Cinnabun from "cinnabun"
import { createChatMessage } from "../../client/actions/chat"
import { userStore } from "../../state"
import { toggleAuthModal } from "../AuthModal"
import { isAuthenticated } from "../../state"
import { isNotAuthenticated } from "../../state"

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
        bind:visible={isAuthenticated}
        bind:disabled={() => !inputState.value}
        onclick={handleSubmit}
      >
        Submit
      </button>

      <button
        watch={[userStore]}
        bind:visible={isNotAuthenticated}
        onclick={toggleAuthModal}
      >
        Log in to chat
      </button>
    </form>
  )
}
