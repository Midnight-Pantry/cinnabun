import { createPortal } from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"

export const Portal = ({ children }: PropsWithChildren) => {
  const rootId = "portal-root"
  return createPortal(children ?? [], rootId)
}
