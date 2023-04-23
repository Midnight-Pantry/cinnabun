import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"
import { Greeter } from "./Greeter"

export const SignalsExample = () => {
  const count = createSignal(0)

  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => count.value++}>click me</button>
      <br />
      <br />
      <input
        value={count}
        onChange={(e) => {
          count.value = parseInt((e.target as HTMLInputElement).value)
        }}
      />
      <Greeter count={count} />
    </>
  )
}
