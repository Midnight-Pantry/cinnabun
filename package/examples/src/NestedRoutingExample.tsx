import * as Cinnabun from "cinnabun"
import { Signal } from "cinnabun"
import { Link, Router, Route } from "cinnabun/router"

const ChildComponent = ({ params }: any) => {
  console.log("params", params)
  //const {params} =
  return <h1>test</h1>
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
          path="/:123"
          component={({ params }: any) => <ChildComponent params={params} />}
        />
      </Router>
    </>
  )
}
