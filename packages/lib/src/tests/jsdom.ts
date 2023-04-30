import { JSDOM } from "jsdom"

declare global {
  namespace NodeJS {
    interface Global {
      document: Document
      window: Window
      navigator: Navigator
    }
  }
}

const { window } = new JSDOM()
global.document = window.document
global.window = global.document.defaultView!

export default JSDOM
