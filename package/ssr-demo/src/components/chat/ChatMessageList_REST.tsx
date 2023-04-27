import * as Cinnabun from "cinnabun"
import { Cinnabun as cb } from "cinnabun"
import { ChatMessagesResponse } from "../../types/chat"
import { getChatMessages } from "../../client/actions/chat"
import { prefetchChatMessages } from "../../server/actions/chat"

export const ChatMessageList_REST = () => {
  return (
    <Cinnabun.Suspense
      prefetch
      promise={cb.isClient ? getChatMessages : prefetchChatMessages}
    >
      {(loading: boolean, res: ChatMessagesResponse) => {
        if (res?.error) return <p>{res.error}</p>
        if (loading) return <p>loading chat messages...</p>
        return res && <ul>{...res.data.map((c) => <li>{c.contents}</li>)}</ul>
      }}
    </Cinnabun.Suspense>
  )
}
