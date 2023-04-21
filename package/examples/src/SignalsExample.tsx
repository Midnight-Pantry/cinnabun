import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"

export const SignalsExample = () => {
  const count = createSignal(0)

  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => count.value++}>click me</button>
      <br />
      <br />
      <input
        watch={count}
        bind:value={() => count.value}
        onChange={(e) => {
          count.value = parseInt((e.target as HTMLInputElement).value)
        }}
      />
    </>
  )
}
