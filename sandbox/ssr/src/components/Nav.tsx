import * as Cinnabun from "cinnabun"
import { Link } from "cinnabun/router"

export const Nav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Signals</Link>
        </li>
        <li>
          <Link to="/context">Context</Link>
        </li>
        <li>
          <Link to="/suspense">Suspense</Link>
        </li>
        <li>
          <Link to="/nested-routing">Nested Routing</Link>
        </li>
        <li>
          <Link to="/todo">ToDo</Link>
        </li>
        <li>
          <Link to="/perf">Performance test</Link>
        </li>
        <li>
          <Link to="/chat">Chat</Link>
        </li>
        <li>
          <Link to="/fc-with-children">FC w/ Children</Link>
        </li>
        <li>
          <Link to="/lazy-list">Lazy List</Link>
        </li>
      </ul>
    </nav>
  )
}
