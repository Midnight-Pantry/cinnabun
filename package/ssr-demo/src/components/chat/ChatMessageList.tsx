import * as Cinnabun from "cinnabun"
import { Cinnabun as cb } from "cinnabun"
import { IChatMessage } from "../../types/chat"
import { LiveSocket } from "../../client/liveSocket"
import { prefetchChatMessages } from "../../server/actions/chat"

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
    <div className="chat-list" watch={chatMessages} bind:render>
      {() => <ul>{...chatMessages.value.map((c) => <li>{c.contents}</li>)}</ul>}
    </div>
  )
}
