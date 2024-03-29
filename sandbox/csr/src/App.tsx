import * as Cinnabun from "cinnabun"
import { Route, Router } from "cinnabun/router"
import {
  SignalsExample,
  ContextExample,
  SuspenseExample,
  NestedRoutingExample,
  FCWithChildrenExample,
  ToDoExample,
  LazyListExample,
  PortalExample,
} from "@cinnabun/example-components"
import { Nav } from "./Nav"

export const App = () => {
  return (
    <div style="display: flex; minHeight: 100vh">
      <h1>Cinnabun JS</h1>
      <br />
      <Nav />

      <main style="text-align: center; flex-grow: 1">
        <Router>
          <Route path="/" component={<SignalsExample />} />
          <Route path="/context" component={<ContextExample />} />
          <Route path="/suspense" component={<SuspenseExample cache />} />
          <Route path="/nested-routing" component={<NestedRoutingExample />} />
          <Route path="/todo" component={<ToDoExample />} />
          <Route
            path="/fc-with-children"
            component={
              <FCWithChildrenExample>
                <h4>This is a Functional Component child!</h4>
              </FCWithChildrenExample>
            }
          />
          <Route path="/lazy-list" component={<LazyListExample />} />
          <Route path="/portals" component={<PortalExample />} />
        </Router>
      </main>
    </div>
  )
}
