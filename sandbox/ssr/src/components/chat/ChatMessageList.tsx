import * as Cinnabun from "cinnabun"
import { Cinnabun as cb, For, type Component } from "cinnabun"
import { IChatMessage } from "../../types/chat"
import { LiveSocket } from "../../client/liveSocket"
import { prefetchChatMessages } from "../../server/actions/chat"
import { getUser, userStore } from "../../state"

let serverData = Cinnabun.createSignal<IChatMessage[]>([])

export const ChatMessageList = () => {
  if (!cb.isClient) {
    prefetchChatMessages().then((res) => {
      if (res.error) {
        console.log("ChatMessageList err", res)
        return
      }
      serverData.value = res.data
    })
  }

  const chatMessages = cb.isClient
    ? cb.getRuntimeService(LiveSocket).chatMessages
    : serverData

  return (
    <div className="chat-message-list">
      <For
        each={chatMessages}
        template={(msg) => <ChatMessageItem message={msg} />}
      />
    </div>
  )
}

const ChatMessageItem = ({ message }: { message: IChatMessage }) => {
  const isOwnMessage = (userData: { username: string } | null | undefined) =>
    message.username === userData?.username

  return (
    <div
      key={message.id}
      watch={userStore}
      bind:className={(self: Component) =>
        `chat-message ${isOwnMessage(getUser(self)) ? "is-owner" : ""}`
      }
    >
      <div className="chat-message-inner">
        <sup className="chat-message-sender">{message.username}</sup>
        <p>{message.contents}</p>
      </div>
    </div>
  )
}
