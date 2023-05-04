import * as Cinnabun from "cinnabun"
import { SuspenseExample } from "@cinnabun/example-components"

export default function Page() {
  return (
    <div>
      <h1>Hello world!</h1>
      <button
        onclick={() => {
          console.log("clicked")
        }}
      >
        Click Me
      </button>
      <SuspenseExample />
    </div>
  )
}
