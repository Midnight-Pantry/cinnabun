import * as Cinnabun from "cinnabun"
import { FileRouter, Link } from "cinnabun/router"
import { pathStore } from "./state"

export const App = () => {
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SSR App</title>
        <link rel="stylesheet" href="/static/index.css" />
      </head>

      <body style={{ background: "#222", color: "#eee" }}>
        <div id="app">
          <div style={{ display: "flex", minHeight: "100vh" }}>
            <h1>Cinnabun JS - SSR</h1>
            <main style={{ textAlign: "center", flexGrow: "1" }}>
              <h1>Welcoom</h1>
              <nav>
                <ul>
                  <li>
                    <Link store={pathStore} to="/" innerText="Home" />
                  </li>
                  <li>
                    <Link store={pathStore} to="/users" innerText="Users" />
                  </li>
                  <li>
                    <Link
                      store={pathStore}
                      to="/users/123"
                      innerText="Users/123"
                    />
                  </li>
                </ul>
              </nav>
              <FileRouter />
            </main>
          </div>
        </div>
      </body>
    </>
  )
}
