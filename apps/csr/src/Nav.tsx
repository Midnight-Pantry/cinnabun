import * as Cinnabun from "cinnabun"
import { Link } from "cinnabun/router"
import { pathStore } from "./state"

export const Nav = () => (
  <nav>
    <ul>
      <li>
        <Link to="/" store={pathStore}>
          Signals
        </Link>
      </li>
      <li>
        <Link to="/context" store={pathStore}>
          Context
        </Link>
      </li>
      <li>
        <Link to="/suspense" store={pathStore}>
          Suspense
        </Link>
      </li>
      <li>
        <Link to="/nested-routing" store={pathStore}>
          Nested Routing
        </Link>
      </li>
      <li>
        <Link to="/todo" store={pathStore}>
          ToDo
        </Link>
      </li>
      <li>
        <Link to="/fc-with-children" store={pathStore}>
          FC w/ Children
        </Link>
      </li>
      <li>
        <Link to="/lazy-list" store={pathStore}>
          Lazy List
        </Link>
      </li>
    </ul>
  </nav>
)
