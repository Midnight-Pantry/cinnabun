import { Signal } from "./signal"
import { ComponentProps } from "./types"

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

export const jsPropToHtmlProp = (prop: string): string => {
  switch (prop) {
    case "className":
      return "class"
    default:
      return prop
  }
}

export const htmlPropToJsProp = (prop: string): string => {
  switch (prop) {
    case "class":
      return "className"
    default:
      return prop
  }
}

export const validHtmlProps = (props: ComponentProps & Record<string, any>) => {
  const validProps: Record<string, any> = {}
  Object.keys(props).forEach((k) => {
    if (k.includes(":")) return
    if (k === "innerText") return
    if (k === "children") return
    if (k === "promise") return
    if (k === "ref") return
    if (k === "cache") return
    if (k === "className") {
      validProps.class = props[k]
      return
    }
    if (props[k] instanceof Signal) {
      validProps[k] = props[k].value
      return
    }
    validProps[k] = props[k]
  })
  return validProps
}

export const generateUUID = () => {
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
