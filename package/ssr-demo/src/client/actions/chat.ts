export const createChatMessage = async (message: string): Promise<boolean> => {
  try {
    const res = await fetch("/message", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
    return res.ok
  } catch (error) {
    return false
  }
}
