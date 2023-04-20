import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"

const count = createSignal(23)

export const Counter = () => {
  return (
    <div>
      <h1 test="h1">{count}</h1>
      <button onClick={() => count.value++}>Click me</button>
    </div>
  )
}
