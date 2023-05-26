import * as Cinnabun from "cinnabun"
import { Link } from "cinnabun/router"
import { pathStore } from "../state"

export const Nav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/" innerText="Signals" store={pathStore} />
        </li>
        <li>
          <Link to="/context" innerText="Context" store={pathStore} />
        </li>
        <li>
          <Link to="/suspense" innerText="Suspense" store={pathStore} />
        </li>
        <li>
          <Link
            to="/nested-routing"
            innerText="Nested Routing"
            store={pathStore}
          />
        </li>
        <li>
          <Link to="/todo" innerText="ToDo" store={pathStore} />
        </li>
        <li>
          <Link to="/perf" innerText="Performance test" store={pathStore} />
        </li>
        <li>
          <Link to="/chat" innerText="Chat" store={pathStore} />
        </li>
        <li>
          <Link
            to="/fc-with-children"
            innerText="FC w/ Children"
            store={pathStore}
          />
        </li>
      </ul>
    </nav>
  )
}
