import { Link, Route, Router } from "cinnabun/router"
import { pathStore } from "./state"

export default function () {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <h1>Cinnabun JS - SSR x Vite</h1>
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
        <Route path="/" component={<h1>Home</h1>} />
        <Route path="/test" component={<h1>Test</h1>} />
      </Router>
    </div>
  )
}
