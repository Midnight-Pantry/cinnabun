import * as Cinnabun from "cinnabun"
import { Cinnabun as cb, createSignal } from "cinnabun"
import { Route, Router } from "cinnabun/router"
import Page0 from "./Page"
import Page1 from "./users/Page"
import Page2 from "./users/[id]/Page"
const pathStore = createSignal(cb.isClient ? window.location.pathname : "/")

export const FileRouter = () => {
  return (
    <Router store={pathStore}>
    <Route path="/" component={(props) => <Page0 {...props} />} />
      <Route path="/users" component={(props) => <Page1 {...props} />} />
      <Route path="/users/:id" component={(props) => <Page2 {...props} />} />
      
  </Router>
  )
}

  