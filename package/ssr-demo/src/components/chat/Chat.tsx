import * as Cinnabun from "cinnabun"
import { ChatMessageList } from "./ChatMessageList"
import { ChatForm } from "./ChatForm"

export const Chat = () => {
  return (
    <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
      <ChatMessageList />
      <ChatForm />
    </div>
  )
}
