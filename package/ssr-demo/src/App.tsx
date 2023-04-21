import * as Cinnabun from "cinnabun"
import { SignalsExample, ToDoExample } from "@cinnabun/examples"
import { Route, Router } from "cinnabun/router"
import { pathStore } from "./state"

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

const Routes = () => {
  return (
    <Router store={pathStore}>
      <Route path="/" component={<h1>Home</h1>} />
    </Router>
  )
}

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
