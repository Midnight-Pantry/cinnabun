import * as Cinnabun from "cinnabun"

const count = Cinnabun.createSignal(23)

export const App = () => {
  return (
    <div test="outer div">
      <h1 test="h1">{count}</h1>
      <button
        onClick={() => {
          count.value++
          console.log("clicked", count)
        }}
      >
        Click me
      </button>
      {() => <h1>test</h1>}
      <ul>
        {...Array(10_000)
          .fill(0)
          .map((_, i) => <li>{i.toString()}</li>)}
      </ul>
    </div>
  )
}
