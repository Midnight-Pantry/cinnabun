import * as Cinnabun from "cinnabun"
import { Link, Route, Router } from "cinnabun/router"
import { About } from "./About"
import { GettingStarted } from "./GettingStarted"
import { Logo } from "./Logo"
import { pathStore } from "../state"

const NavLinks = () => {
  return (
    <>
      <Link store={pathStore} to="/getting-started">
        Get Started
      </Link>
      <Link store={pathStore} to="/components">
        Components
      </Link>
    </>
  )
}

export const App = () => {
  return (
    <>
      <header>
        <div className="header-inner">
          <Link store={pathStore} to="/">
            <Logo />
          </Link>

          <nav>
            <Link store={pathStore} to="/">
              Cinnabun
            </Link>
            <NavLinks />
          </nav>
        </div>
        <nav className="mobile">
          <NavLinks />
        </nav>
      </header>

      <main>
        <Router store={pathStore}>
          <Route path="/" component={About} />
          <Route path="/getting-started" component={GettingStarted} />
        </Router>
      </main>
      <footer></footer>
    </>
  )
}
