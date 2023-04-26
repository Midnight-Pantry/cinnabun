import * as Cinnabun from "cinnabun"
import { Cinnabun as cb } from "cinnabun"
import { ServerPromise } from "cinnabun/ssr"
import { Either } from "cinnabun/types"
import { ChatMessages } from "../../server/chat"

interface IChatMessage {
  id: string
  contents: string
  username: string
}

type ChatMessagesResponse = Either<{ error: Error }, { data: IChatMessage[] }>

async function prefetchMessages(): ServerPromise<ChatMessagesResponse> {
  try {
    return { data: ChatMessages.getAll() }
  } catch (error) {
    return { error: error as Error }
  }
}

async function getChatMessages(): Promise<ChatMessagesResponse> {
  try {
    const res = await fetch("http://localhost:3000/messages")
    if (!res.ok) throw new Error(res.statusText ?? "Failed to load messages")

    const data = await res.json()

    return {
      data: data.messages,
    }
  } catch (error) {
    return { error: error as Error }
  }
}

export const ChatMessageList = () => {
  return (
    <Cinnabun.Suspense
      prefetch
      promise={cb.isClient ? getChatMessages : prefetchMessages}
    >
      {(loading: boolean, res: ChatMessagesResponse) => {
        if (res?.error) return <p>{res.error}</p>
        if (loading) return <p>loading chat messages...</p>
        return res && <ul>{...res.data.map((c) => <li>{c.contents}</li>)}</ul>
      }}
    </Cinnabun.Suspense>
  )
}
