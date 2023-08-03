import * as Cinnabun from "cinnabun"
import { useComputed, useSignal } from "cinnabun"

export const SignalsExample = () => {
  const [count, setCount] = useSignal(0)
  const [count2, setCount2] = useSignal(0)

  useComputed(() => {
    console.log("count changed", count.value + count2.value)
    return 123
  }, [count, count2])

  return (
    <>
      <h1>{count}</h1>
      <h1>{count2}</h1>
      <button onclick={() => setCount((prev) => prev + 1)}>click me</button>
      <button onclick={() => setCount2((prev) => prev + 1)}>click me</button>
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
