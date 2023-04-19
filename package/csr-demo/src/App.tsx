import { Link, Route, Router } from "cinnabun/router"
import { pathStore } from "./state"
import {
  SignalsExample,
  ContextExample,
  SuspenseExample,
  NestedRoutingExample,
} from "./examples"

export const App = () => {
  return (
    <>
      <h1>Cinnabun JS</h1>
      <br />
      <nav>
        <ul>
          <li>
            <Link to="/" innerText="Signals" store={pathStore} />
          </li>
          <li>
            <Link to="/context" innerText="Context" store={pathStore} />
          </li>
          <li>
            <Link to="/suspense" innerText="Suspense" store={pathStore} />
          </li>
          <li>
            <Link
              to="/nested-routing"
              innerText="Nested Routing"
              store={pathStore}
            />
          </li>
        </ul>
      </nav>
      <main style={{ textAlign: "center" }}>
        <Router store={pathStore}>
          <Route path="/" component={<SignalsExample />} />
          <Route path="/context" component={<ContextExample />} />
          <Route path="/suspense" component={<SuspenseExample />} />
          <Route path="/nested-routing" component={<NestedRoutingExample />} />
        </Router>
      </main>
    </>
  )
}
