import * as Cinnabun from "cinnabun"
import { Route, Router } from "cinnabun/router"
import { pathStore } from "./state"
import { Logo } from "./Logo"
import { SuspenseExample } from "@cinnabun/example-components"

const state = Cinnabun.createSignal(123)

export const App = () => {
  return (
    <div style="display: flex; min-height: 100vh">
      <div style={{ display: "flex", gap: "1rem" }}>
        <h1>Cinnabun JS - SSR</h1>
        <Logo />
      </div>

      <main style={{ textAlign: "center", flexGrow: "1" }}>
        <Router store={pathStore}>
          <Route
            path="/"
            component={Cinnabun.lazy(import("./Page"), { state })}
          />
          <Route
            path="/:test"
            component={(props) =>
              Cinnabun.lazy(import("./Page"), { ...props, state })
            }
          />
        </Router>
      </main>
      <div style="max-height: 300px; overflow-y:scroll">
        <SuspenseExample />
      </div>
    </div>
  )
}
