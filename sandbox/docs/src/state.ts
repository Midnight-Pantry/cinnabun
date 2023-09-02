import { createSignal } from "cinnabun"

export const pathStore = createSignal<string>(getPath(window.location.pathname))

function getPath(src: string) {
  return src.length > 1 && src.charAt(src.length - 1) === "/"
    ? src.substring(0, src.length - 1)
    : src
}

window.addEventListener("popstate", (e) => {
  pathStore.value = getPath((e.target as Window)?.location.pathname)
})
