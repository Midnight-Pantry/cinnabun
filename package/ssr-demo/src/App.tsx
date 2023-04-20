import * as Cinnabun from "cinnabun"
import { Counter } from "./Counter"
import { ToDo } from "./ToDo"

const PerfTest = ({ n }: { n: number }) => {
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
    <div>
      <h1>Cinnabun JS - SSR</h1>
      <main>
        <Counter />
        <br />
        {/* <p render={false}>Don't render me!</p> */}
        <ToDo />
        {/* <PerfTest n={10_000} /> */}
      </main>
    </div>
  )
}
