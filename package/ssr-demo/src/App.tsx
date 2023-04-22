import * as Cinnabun from "cinnabun"
import { SignalsExample, ToDoExample } from "@cinnabun/examples"
import { Link, Route, Router } from "cinnabun/router"
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

const Divider = () => <hr style={{ width: "300px", margin: "1rem" }} />

const RoutesExample = () => {
  return (
    <>
      <Link store={pathStore} to="/">
        Home
      </Link>
      <Link store={pathStore} to="/test">
        Test
      </Link>
      <Router store={pathStore}>
        <Route path="/" component={<article>Home</article>} />
        <Route path="/test" component={<article>Test</article>} />
      </Router>
    </>
  )
}

export const App = () => {
  return (
    <>
      <h1>Cinnabun JS - SSR</h1>
      <SignalsExample />
      <Divider />
      <RoutesExample />
      <Divider />
      <ToDoExample />
      <Divider />
      <PerfTest n={500} />
    </>
  )
}
