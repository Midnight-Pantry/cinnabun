import * as Cinnabun from "cinnabun"
import { ChatMessageList } from "./ChatMessageList.jsx"
import { ChatForm } from "./ChatForm.jsx"
import "./chat.css"
//import { ChatMessageList_REST } from "./ChatMessageList_REST"

export const Chat = () => {
  return (
    <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
      <ChatMessageList />
      {/* <ChatMessageList_REST /> */}
      <ChatForm />
    </div>
  )
}
