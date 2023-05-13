import { Signal, createSignal } from "cinnabun"
import { IChatMessage } from "../types/chat.js"
import { getChatMessages } from "./actions/chat.js"

type TypedMessage = {
  type: string
  data?: any
}

export class LiveSocket {
  socket: any
  public chatMessages: Signal<IChatMessage[]> = createSignal(
    [] as IChatMessage[]
  )
  constructor(url: string) {
    this.socket = new WebSocket(url)
    this.socket.onmessage = (msg: any) => {
      try {
        const data = JSON.parse(msg.data)
        if (!("type" in data)) throw new Error("received invalid message")
        this.handleMessage(data as TypedMessage)
      } catch (error) {
        console.error(error)
      }
    }
    this.socket.onopen = () => {
      setInterval(() => {
        if (this.socket.readyState !== this.socket.OPEN) return
        this.socket.send(JSON.stringify({ type: "ping" }))
      }, 1000)
    }

    this.load()
  }

  private async load() {
    const res = await getChatMessages()
    if (res.error) return
    this.chatMessages.value = res.data
  }

  private handleMessage(message: TypedMessage) {
    switch (message.type) {
      case "+chat":
        this.chatMessages.value.push(message.data as IChatMessage)
        this.chatMessages.notify()
        break
      case "-chat":
        const idx = this.chatMessages.value.findIndex(
          (item: IChatMessage) => item.id === message.data.id
        )
        if (idx === -1) return
        this.chatMessages.value.splice(idx, 1)
        this.chatMessages.notify()
        break
      case "ping":
        return
      default:
        return
    }
  }
}

export const createLiveSocket = () => {
  const { hostname, port } = window.location
  return new LiveSocket(`ws://${hostname}:${port}/ws`)
}
