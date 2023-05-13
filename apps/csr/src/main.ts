import "./style.css"
import { Cinnabun } from "cinnabun"
import { App } from "./App.jsx"

const root = document.getElementById("app")!
Cinnabun.bake(App(), root)
