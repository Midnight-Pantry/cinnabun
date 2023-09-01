import * as Cinnabun from "cinnabun"
import { Link, Router, Route } from "cinnabun/router"

const ChildComponent = ({ params }: any) => {
  return <h1>{params.test}</h1>
}

export const NestedRoutingExample = () => (
  <>
    <Link to="/nested-routing/abc">abc</Link>
    <Router>
      <Route
        path="/:test"
        component={(props) => <ChildComponent {...props} />}
      />
    </Router>
  </>
)
