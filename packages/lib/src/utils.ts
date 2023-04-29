export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getCookie = (key: string) => {
  const cookies = document.cookie.split(";")
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.startsWith(key + "=")) {
      try {
        const res = decodeURIComponent(cookie.substring(key.length + 1))
        return JSON.parse(res)
      } catch (error) {
        console.error("getCookie error", error)
        return null
      }
    }
  }
  return null
}

export const getInputType = (val: any): string => {
  switch (typeof val) {
    case "boolean":
      return "checkbox"
    case "number":
      return "number"
    case "string":
    case undefined:
      return "text"
  }
  throw new Error(
    "unable to get input type for val with type: " + typeof val + " - " + val
  )
}
