import * as Cinnabun from "cinnabun"
import { FileRouter } from "cinnabun/ssr"

export const App = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <h1>Cinnabun JS - SSR</h1>
      <main style={{ textAlign: "center", flexGrow: "1" }}>
        <FileRouter />
      </main>
    </div>
  )
}
