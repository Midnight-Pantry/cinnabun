import * as Cinnabun from "cinnabun"
import { Docs } from "./Docs"
import { GettingStarted } from "./GettingStarted"
import { Logo } from "./Logo"

export const App = () => {
  return (
    <>
      <header>
        <Logo />
        <span style="font-size: 1.5rem;font-weight: bold;">Cinnabun</span>
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
