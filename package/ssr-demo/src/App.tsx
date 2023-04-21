import * as Cinnabun from "cinnabun"
import { SignalsExample, ToDoExample } from "@cinnabun/examples"

const PerfTest = ({ n }: { n: number }) => {
  return (
    <ul>
      {...Array(n)
        .fill(0)
        .map((_, i) => <li>{i}</li>)}
    </ul>
  )
}

export const App = () => {
  return (
    <div>
      <h1>Cinnabun JS - SSR</h1>
      <main>
        <SignalsExample />
        <br />
        <ToDoExample />
        <br />
        <PerfTest n={5_000} />
      </main>
    </div>
  )
}
