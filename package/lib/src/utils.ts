export const sleep = async (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
