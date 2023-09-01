import * as Cinnabun from "cinnabun"
import { useSignal } from "cinnabun"

export const SignalsExample = () => {
  const [count, setCount] = useSignal(0)

  return (
    <>
      <h1>{count}</h1>
      <button onclick={() => setCount((prev) => prev + 1)}>click me</button>
      <br />
      <br />
      <input
        value={count}
        onkeyup={(e: Event) => {
          setCount(parseInt((e.target as HTMLInputElement).value))
        }}
      />
    </>
  )
}
