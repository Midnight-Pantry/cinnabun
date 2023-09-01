import * as Cinnabun from "cinnabun"
import { SideNav } from "./SideNav"
import { Route, Router } from "cinnabun/router"
import { DocContent } from "./DocContent"
import { pathStore } from "../../state"

export const Docs = () => {
  return (
    <section>
      <div className="page-container">
        <div className="page-title">
          <h1>Docs</h1>
        </div>
        <div className="page-content">
          <div className="page-content__sidebar">
            <SideNav />
          </div>
          <div className="page-content__main">
            <Router store={pathStore}>
              <Route path="/:title" component={DocContent} />
            </Router>
          </div>
        </div>
      </div>
    </section>
  )
}
