import * as Cinnabun from "cinnabun"
import "./Header.css"
import { Logo } from "./Logo"
import { Navigation } from "./Navigation"

export const Header = () => {
  return (
    <header>
      <Logo className="header-logo" />
      <Navigation />
    </header>
  )
}
