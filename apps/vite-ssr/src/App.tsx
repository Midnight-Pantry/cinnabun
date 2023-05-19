import { createSignal, Cinnabun as cb } from "cinnabun"
import { Link, Route, Router } from "cinnabun/router"

const pathStore = createSignal(cb.isClient ? window.location.pathname : "/")

const count = createSignal(0)

export default function () {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <h1>Cinnabun JS - SSR x Vite </h1>
      <nav>
        <ul>
          <li>
            <Link to="/" store={pathStore}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/test" store={pathStore}>
              Test
            </Link>
          </li>
        </ul>
      </nav>
      <Router store={pathStore}>
        <Route path="/" component={<Home />} />
        <Route path="/test" component={<Test />} />
      </Router>
    </div>
  )
}

const Home = () => {
  return (
    <>
      <h1>Home</h1>
      <h4>{count}</h4>
      <button onclick={() => count.value++}>Click me!</button>
    </>
  )
}

const Test = () => {
  return (
    <>
      <h1>Test</h1>
      <Router store={pathStore}>
        <Route
          path="/:test"
          component={(props) => <h1>{props.params.test}</h1>}
        />
      </Router>
    </>
  )
}
