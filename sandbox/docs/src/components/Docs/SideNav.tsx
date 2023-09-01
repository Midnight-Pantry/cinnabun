import * as Cinnabun from "cinnabun"
import { Link } from "cinnabun/router"
import { pathStore } from "../../state"

export const SideNav = () => {
  return (
    <nav className="side-nav">
      <ul>
        <li>
          <Link store={pathStore} to="/docs/getting-started">
            Getting Started
          </Link>
        </li>
      </ul>
    </nav>
  )
}
