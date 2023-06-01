import * as Cinnabun from "cinnabun"
import { Route, Router } from "cinnabun/router"
import { pathStore } from "./state"
import {
  SignalsExample,
  ContextExample,
  SuspenseExample,
  NestedRoutingExample,
  FCWithChildrenExample,
  SmartToDoExample,
  LazyListExample,
} from "@cinnabun/example-components"
import { Nav } from "./Nav"

export const App = () => {
  return (
    <div style="display: flex; minHeight: 100vh">
      <h1>Cinnabun JS</h1>
      <br />
      <Nav />

      <main style="text-align: center; flex-grow: 1">
        <Router store={pathStore}>
          <Route path="/" component={<SignalsExample />} />
          <Route path="/context" component={<ContextExample />} />
          <Route path="/suspense" component={<SuspenseExample cache />} />
          <Route
            path="/nested-routing"
            component={<NestedRoutingExample {...{ pathStore }} />}
          />
          <Route path="/todo" component={<SmartToDoExample />} />
          <Route
            path="/fc-with-children"
            component={
              <FCWithChildrenExample>
                <h4>This is a Functional Component child!</h4>
              </FCWithChildrenExample>
            }
          />
          <Route path="/lazy-list" component={<LazyListExample />} />
        </Router>
      </main>
    </div>
  )
}
