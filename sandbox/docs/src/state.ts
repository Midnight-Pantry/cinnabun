import { Cinnabun, createSignal } from "cinnabun"

export const pathStore = createSignal<string>(
  Cinnabun.isClient ? getPath(window.location.pathname) : "/"
)

function getPath(src: string) {
  return src.length > 1 && src.charAt(src.length - 1) === "/"
    ? src.substring(0, src.length - 1)
    : src
}

if (Cinnabun.isClient) {
  window.addEventListener("popstate", (e) => {
    pathStore.value = getPath((e.target as Window)?.location.pathname)
  })
}
