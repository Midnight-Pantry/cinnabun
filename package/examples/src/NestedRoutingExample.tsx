import * as Cinnabun from "cinnabun"
import { Signal } from "cinnabun"
import { Link, Router, Route } from "cinnabun/router"

export const NestedRoutingExample = ({
  pathStore,
}: {
  pathStore: Signal<string>
}) => {
  return (
    <>
      <Link to="/nested-routing/abc" store={pathStore} innerText="abc" />
      <Router store={pathStore}>
        <Route path="/abc" component={<h1>test</h1>} />
      </Router>
    </>
  )
}
