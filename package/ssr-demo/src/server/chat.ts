import { IChatMessage } from "../types/chat"
import { generateUUID } from "../utils"

export abstract class ChatMessages {
  static messages: Map<string, IChatMessage> = new Map([
    ["abc123", { id: "abc123", contents: "test", username: "moose" }],
  ])

  static getAll(): IChatMessage[] {
    const res: IChatMessage[] = []
    const iter = ChatMessages.messages.entries()
    let val = iter.next()
    while (!val.done) {
      const [id, { contents, username }] = val.value
      res.push({
        id,
        contents,
        username,
      })
      val = iter.next()
    }

    return res
  }

  static create(contents: string, username: string): IChatMessage {
    const id = generateUUID()
    ChatMessages.messages.set(id, { id, contents, username })
    return { id, contents, username }
  }

  static delete(messageId: string, username: string): boolean {
    if (username === "moose") {
      return ChatMessages.messages.delete(messageId)
    }
    const message = ChatMessages.messages.get(messageId)
    if (!message || message.username !== username) return false

    return ChatMessages.messages.delete(messageId)
  }

  static update(
    messageId: string,
    username: string,
    contents: string
  ): boolean {
    const message = ChatMessages.messages.get(messageId)
    if (!message) return false
    if (username === "moose" || username === message.username) {
      message.contents = contents
      return true
    }
    return false
  }
}
