import { FastifyInstance } from "fastify"
import { IChatMessage } from "../types/chat.js"
import { generateUUID } from "../utils.js"

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

export function configureChatRoutes(app: FastifyInstance) {
  app.get("/messages", async () => {
    return { messages: ChatMessages.getAll() }
  })
  app.post("/message", { onRequest: [app.authenticate] }, async (req, res) => {
    const { message } = req.body as { message?: string }
    const { username } = req.user as { username: string }
    if (typeof message !== "string") {
      res.status(400).send()
      return
    }
    const msg = ChatMessages.create(message, username)
    app.websocketServer?.clients.forEach(function each(client: any) {
      client.send(JSON.stringify({ type: "+chat", data: msg }))
    })
  })
}
