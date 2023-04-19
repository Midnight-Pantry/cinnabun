import { Link, Router, Route } from "cinnabun/router"
import { pathStore } from "../state"

export const NestedRoutingExample = () => {
  return (
    <div>
      <Link to="/nested-routing/abc" store={pathStore} innerText="abc" />
      <Router store={pathStore}>
        <Route path="/abc" component={<h1>test</h1>} />
      </Router>
    </div>
  )
}
