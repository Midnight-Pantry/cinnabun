import * as Cinnabun from "cinnabun"
import { Docs } from "./Docs"
import { GettingStarted } from "./GettingStarted"
import { Logo } from "./Logo"

export const App = () => {
  return (
    <>
      <header>
        <Logo />
        <a href="#getting-started">Getting Started</a>
      </header>
      <main>
        <Docs />
        <GettingStarted />
      </main>
      <footer></footer>
    </>
  )
}
