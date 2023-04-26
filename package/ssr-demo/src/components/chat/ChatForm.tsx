import * as Cinnabun from "cinnabun"
import { createChatMessage } from "../../client/actions/chat"

export const ChatForm = () => {
  const inputState = Cinnabun.createSignal("")

  const handleSubmit = async () => {
    const res = await createChatMessage(inputState.value)
    if (res) inputState.value = ""
  }

  return (
    <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <input
        value={inputState}
        onChange={(e) => {
          inputState.value = (e.target as HTMLInputElement).value
        }}
      />
      <button
        watch={inputState}
        bind:disabled={() => !inputState.value}
        type="button"
        onClick={() => handleSubmit()}
      >
        Submit
      </button>
    </form>
  )
}
