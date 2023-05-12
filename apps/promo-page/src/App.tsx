import { Link, Route, Router } from "cinnabun/router"
import { pathStore } from "./state"
import { Logo } from "./Logo"
import { ExampleClass } from "./test"

export const App = () => {
  console.log("about to instantiate class")
  const test = new ExampleClass()
  test.method()

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <h1>Cinnabun JS</h1>

      <br />

      <Logo />

      <main style={{ textAlign: "center", flexGrow: "1" }}>
        <nav>
          <ul>
            <li>
              <Link to="/" store={pathStore} useHash>
                Home
              </Link>
            </li>
            <li>
              <Link to="/test" store={pathStore} useHash>
                Test
              </Link>
            </li>
          </ul>
        </nav>

        <Router store={pathStore}>
          <Route path="#" component={<h1>Home</h1>} />
          <Route path="#test" component={<h1>Test</h1>} />
        </Router>
      </main>
    </div>
  )
}
