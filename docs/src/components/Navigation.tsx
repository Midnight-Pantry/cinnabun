import "./Navigation.css"
import * as Cinnabun from "cinnabun"
import { Link } from "cinnabun/router"

export const Navigation = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
      </ul>
      <div></div>
    </nav>
  )
}
