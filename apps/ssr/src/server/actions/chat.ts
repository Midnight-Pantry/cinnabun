import { ServerPromise } from "cinnabun/types"
import { ChatMessagesResponse } from "../../types/chat.js"
import { ChatMessages } from "../chat.js"

export async function prefetchChatMessages(): ServerPromise<ChatMessagesResponse> {
  try {
    return { data: ChatMessages.getAll() }
  } catch (error) {
    return { error: error as Error }
  }
}
