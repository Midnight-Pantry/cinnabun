import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"

const count = createSignal(0)

export const Counter = () => {
  return (
    <article>
      <h1 test="h1">{count}</h1>
      <button onClick={() => count.value++}>Click me</button>
      <br />
      <span watch={count} bind:render={() => count.value % 2 === 0}>
        Even
      </span>
    </article>
  )
}
