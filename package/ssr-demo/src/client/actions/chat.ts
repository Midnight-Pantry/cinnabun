export const createChatMessage = async (message: string): Promise<boolean> => {
  await fetch("/message", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
  return true
}
