import * as Cinnabun from "cinnabun"
import { ComponentChild } from "cinnabun/src/types"

export default function Template({ children }: { children: ComponentChild[] }) {
  return (
    <div>
      <h1>Admin</h1>
      {...children}
    </div>
  )
}
