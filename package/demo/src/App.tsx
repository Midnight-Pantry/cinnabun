import { Link, Route, Router } from "cinnabun/router"
import { pathStore } from "./state"
import { SignalsExample, ContextExample, SuspenseExample } from "./examples"

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
        </ul>
      </nav>
      <main style={{ textAlign: "center" }}>
        <Router store={pathStore}>
          <Route path="/" component={<SignalsExample />} />
          <Route path="/context" component={<ContextExample />} />
          <Route path="/suspense" component={<SuspenseExample />} />
          <Route path="/test" component={<NestedRoutingExample />} />
        </Router>
      </main>
    </>
  )
}

const NestedRoutingExample = () => {
  return (
    <div>
      <button>Test</button>
      <Router store={pathStore}>
        {" "}
        {/* implicitly knows that it lives in /test */}
        <Route path="/test" component={<h1>test</h1>} />{" "}
        {/* path should be evaluated as /test/test */}
      </Router>
    </div>
  )
}
