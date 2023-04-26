function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime() //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0 //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })
}

interface IChatMessage {
  contents: string
  username: string
}

interface IChatMessageResponse extends IChatMessage {
  id: string
}

export abstract class ChatMessages {
  static messages: Map<string, IChatMessage> = new Map([
    ["abc123", { contents: "test", username: "moose" }],
  ])

  static getAll(): IChatMessageResponse[] {
    const res: IChatMessageResponse[] = []
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

  static create(contents: string, username: string) {
    ChatMessages.messages.set(generateUUID(), { contents, username })
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
