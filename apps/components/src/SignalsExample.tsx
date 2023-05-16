import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"
import { Greeter } from "./Greeter"

export const SignalsExample = () => {
  const count = createSignal(0)

  return (
    <>
      <h1>{count}</h1>
      <button onclick={() => count.value++}>click me</button>
      <br />
      <br />
      <input
        value={count}
        onkeyup={(e: Event) => {
          count.value = parseInt((e.target as HTMLInputElement).value)
        }}
      />
      <Greeter count={count} />
    </>
  )
}
