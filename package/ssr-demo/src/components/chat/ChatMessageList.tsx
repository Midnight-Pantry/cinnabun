import * as Cinnabun from "cinnabun"
import { Cinnabun as cb } from "cinnabun"
import { IChatMessage } from "../../types/chat"
import { LiveSocket } from "../../client/liveSocket"
import { prefetchChatMessages } from "../../server/actions/chat"
import { userStore } from "../../state"

let serverData: IChatMessage[] = []

export const ChatMessageList = () => {
  if (!cb.isClient) {
    prefetchChatMessages().then((res) => {
      if (res.error) return
      serverData = res.data
    })
  }

  const chatMessages = cb.isClient
    ? cb.getRuntimeService(LiveSocket).chatMessages
    : Cinnabun.createSignal(serverData)

  return (
    <div
      className="chat-message-list"
      watch={[chatMessages, userStore]}
      bind:render
    >
      {() => (
        <>
          {...chatMessages.value.map((message) => (
            <ChatMessageItem message={message} />
          ))}
        </>
      )}
    </div>
  )
}

const ChatMessageItem = ({ message }: { message: IChatMessage }) => {
  const isOwnMessage =
    userStore.value && userStore.value.username === message.username
  return (
    <div className={`chat-message ${isOwnMessage ? "is-owner" : ""}`}>
      <div className="chat-message-inner">
        <sup className="chat-message-sender">{message.username}</sup>
        <p>{message.contents}</p>
      </div>
    </div>
  )
}
