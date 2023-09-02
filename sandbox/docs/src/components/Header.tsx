import * as Cinnabun from "cinnabun"
import "./Header.css"
import { Logo } from "./Logo"
import { Link } from "cinnabun/router"
import { pathStore } from "../state"

export const Header = () => {
  return (
    <header>
      <Logo className="header-logo" />
      <nav>
        <ul>
          <li>
            <Link store={pathStore} to="/cinnabun">
              Home
            </Link>
          </li>
          <li>
            <Link store={pathStore} to="/cinnabun/docs">
              Docs
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
