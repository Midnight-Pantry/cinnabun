import * as Cinnabun from "cinnabun"
import { type Component } from "cinnabun"

export const Template = (App: { (): Component }) => (
  <>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>SSR App</title>
      <link rel="stylesheet" href="/static/index.css" />
    </head>

    <body style={{ background: "#222", color: "#eee" }}>
      <div id="app">
        <App />
      </div>
      <div id="portal-root"></div>
    </body>
  </>
)
