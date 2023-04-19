import * as Cinnabun from "cinnabun"

const count = Cinnabun.createSignal(0)

export const App = () => {
  return (
    <div>
      <button onClick={() => count.value++}>Click me</button>
    </div>
  )
}
