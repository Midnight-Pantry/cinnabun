import "./styles/style.css"
import "./styles/prism-okaidia.css"
import { Cinnabun } from "cinnabun"
import { App } from "./components/App"

const root = document.getElementById("app")!
Cinnabun.bake(App(), root)
