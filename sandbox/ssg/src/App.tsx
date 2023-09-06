import * as Cinnabun from "cinnabun"
import { SSG } from "cinnabun/ssg"

export default function App() {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>SSG App</title>
      </head>

      <body>
        <div id="app">
          <div style="display: flex; min-height: 100vh">
            <div style="display: flex; gap: 1rem">
              <h1>Cinnabun JS - SSG</h1>
            </div>

            <SSG.StaticRouter />
          </div>
        </div>
      </body>
    </html>
  )
}
