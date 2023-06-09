import { ChatMessagesResponse } from "../../types/chat"

export const createChatMessage = async (message: string): Promise<boolean> => {
  const tkn = localStorage.getItem("token")
  if (!tkn) return false

  const res = await fetch("/message", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      token: JSON.parse(tkn) ?? "",
    },
    body: JSON.stringify({ message }),
  })
  return res.ok
}

export const getChatMessages = async (): Promise<ChatMessagesResponse> => {
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
