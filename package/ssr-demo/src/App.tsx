import * as Cinnabun from "cinnabun"
import { ToDoExample } from "@cinnabun/examples"
import { Counter } from "./Counter"

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
        {/* <SignalsExample /> */}
        <Counter />
        {/* <p render={false}>Don't render me!</p> */}
        <ToDoExample />
        {/* <PerfTest n={10_000} /> */}
        {/* <SuspenseExample /> */}
        {/* <Router store={pathStore}>
          <Route path="/" component={<h1>Test</h1>} />
        </Router> */}
      </main>
    </div>
  )
}
