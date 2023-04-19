import * as Cinnabun from "cinnabun"

const count = Cinnabun.createSignal(23)

export const App = () => {
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={() => count.value++}>Click me</button>
      <p>{Date.now()}</p>
      <ul>
        {...Array(10_000)
          .fill(0)
          .map((_, i) => <li>{i.toString()}</li>)}
      </ul>
    </div>
  )
}
