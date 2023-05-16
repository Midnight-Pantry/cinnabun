import { ServerPromise } from "cinnabun/src/types"
import { ChatMessagesResponse } from "../../types/chat"
import { ChatMessages } from "../chat"

export async function prefetchChatMessages(): ServerPromise<ChatMessagesResponse> {
  try {
    return { data: ChatMessages.getAll() }
  } catch (error) {
    return { error: error as Error }
  }
}
