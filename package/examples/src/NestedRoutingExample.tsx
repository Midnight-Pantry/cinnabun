import * as Cinnabun from "cinnabun"
import { Signal } from "cinnabun"
import { Link, Router, Route } from "cinnabun/router"

const ChildComponent = ({ params }: any) => {
  return <h1>{params.test}</h1>
}

export const NestedRoutingExample = ({
  pathStore,
}: {
  pathStore: Signal<string>
}) => {
  return (
    <>
      <Link to="/nested-routing/abc" store={pathStore} innerText="abc" />
      <Router store={pathStore}>
        <Route
          path="/:test"
          component={(props) => <ChildComponent {...props} />}
        />
      </Router>
    </>
  )
}
