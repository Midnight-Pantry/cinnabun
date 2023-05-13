import * as Cinnabun from "cinnabun"
import { createSignal } from "cinnabun"

const _context = createSignal(0)

export const useGlobalContext = () => {
  return {
    context: _context,
    add: (num: number) => {
      _context.value += num
    },
    subtract: (num: number) => {
      _context.value -= num
    },
  }
}

const Heading = () => {
  const { context } = useGlobalContext()

  return <h1 className="xl">{context}</h1>
}

const Buttons = () => {
  const { add, subtract, context } = useGlobalContext()
  return (
    <>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <button
          watch={context}
          bind:disabled={() => context.value <= 0}
          onclick={() => subtract(5)}
        >
          Subtract
        </button>
        <button
          watch={context}
          bind:disabled={() => context.value >= 15}
          onclick={() => add(5)}
        >
          Add
        </button>
      </div>
      <p watch={context} bind:render={() => context.value > 5}>
        value is greater than 5
      </p>
    </>
  )
}

export const ContextExample = () => {
  return (
    <>
      <Heading />
      <Buttons />
    </>
  )
}
