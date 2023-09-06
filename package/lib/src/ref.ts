import { createSignal } from "./signal.js"

export const useRef = () => {
  return createSignal<null | Element>(null)
}
