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

export const instructionsModalOpen = createSignal(false)
instructionsModalOpen.subscribe((open) => {
  if (open) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = ""
  }
})

export const scrolled = createSignal(false)
const scrollMin = 100
scrolled.value = window.scrollY > scrollMin
window.addEventListener("scroll", () => {
  const isPastMin = window.scrollY > scrollMin
  if (scrolled.value === isPastMin) return
  scrolled.value = isPastMin
})
