import * as Cinnabun from "cinnabun"
import { Route, Router } from "cinnabun/router"
import { Header } from "./Header"

export const App = () => {
  return (
    <>
      <Header />
      <main>
        <Router>
          <Route path="/" component={<div>Home</div>} />
        </Router>
      </main>
      <footer></footer>
    </>
  )
}
