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

const Seperator = () => (
  <div>
    <br />
    <hr />
    <br />
  </div>
)

export const App = () => {
  return (
    <div>
      <h1>Cinnabun JS - SSR</h1>
      <main>
        <SignalsExample />
        <Seperator />
        <ToDoExample />
        <Seperator />

        <PerfTest n={50_000} />
      </main>
    </div>
  )
}
