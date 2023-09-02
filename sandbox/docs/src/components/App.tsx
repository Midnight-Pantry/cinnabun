import * as Cinnabun from "cinnabun"
import { Route, Router } from "cinnabun/router"
import { Header } from "./Header"
import { Docs } from "./Docs/Page"
import { pathStore } from "../state"

export const App = () => {
  return (
    <>
      <Header />
      <main>
        <Router store={pathStore}>
          <Route path="/cinnabun" component={<div>Home</div>} />
          <Route path="/cinnabun/docs" component={Docs} />
        </Router>
      </main>
      <footer></footer>
    </>
  )
}
