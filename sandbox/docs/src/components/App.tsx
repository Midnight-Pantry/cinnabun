import * as Cinnabun from "cinnabun"
import { Route, Router } from "cinnabun/router"
import { Docs } from "./Docs"
import { pathStore } from "../state"
import { GettingStarted } from "./GettingStarted"
import { Logo } from "./Logo"

export const App = () => {
  return (
    <>
      <header>
        <Logo />
        <h1>Cinnabun</h1>
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
