import * as Cinnabun from "cinnabun"
import { PropsWithChildren } from "cinnabun/types"

export const FCWithChildrenExample = ({ children }: PropsWithChildren) => {
  return <div>{children}</div>
}
