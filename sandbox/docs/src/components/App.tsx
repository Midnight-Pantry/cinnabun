import * as Cinnabun from "cinnabun"
import { Link, Route, Router } from "cinnabun/router"
import { About } from "./About"
import { GettingStarted } from "./GettingStarted"
import { Logo } from "./Logo"
import { pathStore } from "../state"
import { Components } from "./Components"

const NavLinks = () => {
  return (
    <>
      <Link store={pathStore} to="/cinnabun/getting-started">
        Getting Started
      </Link>
      <Link store={pathStore} to="/cinnabun/components">
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
          <Link className="flex" store={pathStore} to="/cinnabun">
            <Logo />
          </Link>
          <nav>
            <NavLinks />
          </nav>
        </div>
        <nav className="mobile">
          <NavLinks />
        </nav>
      </header>

      <main>
        <Router store={pathStore}>
          <Route path="/cinnabun" component={About} />
          <Route path="/cinnabun/getting-started" component={GettingStarted} />
          <Route path="/cinnabun/components" component={Components} />
        </Router>
      </main>
      <footer>
        <p>
          <small>
            Made with <span className="heart">❤</span> by{" "}
            <a
              href="https://github.com/Midnight-Pantry"
              target="_blank"
              rel="noopener noreferrer"
            >
              The Midnight Pantry
            </a>
          </small>
        </p>
      </footer>
    </>
  )
}
