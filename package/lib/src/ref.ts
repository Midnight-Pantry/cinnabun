import { createSignal } from "./signal"

export const useRef = () => {
  return createSignal<null | Element>(null)
}
