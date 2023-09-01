import "./Navigation.css"
import * as Cinnabun from "cinnabun"
import { Link } from "cinnabun/router"
import { pathStore } from "../state"

export const Navigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link store={pathStore} to="/">
            Home
          </Link>
        </li>
        <li>
          <Link store={pathStore} to="/docs">
            Docs
          </Link>
        </li>
      </ul>
      <div></div>
    </nav>
  )
}
