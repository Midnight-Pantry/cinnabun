import * as Cinnabun from "cinnabun"
import { lazy } from "cinnabun/src/lazy"
import { Link, Route, Router } from "cinnabun/router"
import { pathStore } from "./state"
import { Logo } from "./Logo"

const state = Cinnabun.createSignal(123)

export const App = () => {
  return (
    <div style="display: flex; min-height: 100vh">
      <div style="display: flex; gap: 1rem;">
        <h1>Cinnabun JS - SSR</h1>

        <Logo />
      </div>
      <Link to="/" store={pathStore}>
        Home
      </Link>
      <Link to="/test" store={pathStore}>
        Test
      </Link>
      <main style="text-align:center; flex-grow: 1;">
        <Router store={pathStore}>
          <Route path="/" component={() => lazy(import("./Page"), { state })} />
          <Route
            path="/:test"
            component={(props) => lazy(import("./Page"), { ...props, state })}
          />
        </Router>
      </main>
    </div>
  )
}
