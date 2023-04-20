import * as Cinnabun from "cinnabun"
import { Counter } from "./Counter"
import { ToDo } from "./ToDo"

const PerfTest = (n: number) => {
  return (
    <ul>
      {...Array(n)
        .fill(0)
        .map((_, i) => <li>{i.toString()}</li>)}
    </ul>
  )
}

export const App = () => {
  return (
    <div test="outer div">
      <Counter />
      <br />
      <ToDo />
      <p render={false}>Don't render me!</p>
    </div>
  )
}
