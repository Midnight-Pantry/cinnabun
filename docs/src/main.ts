import "./style.css"
import { Cinnabun } from "cinnabun"
import { App } from "./components/App"

const root = document.getElementById("app")!
Cinnabun.bake(App(), root)
