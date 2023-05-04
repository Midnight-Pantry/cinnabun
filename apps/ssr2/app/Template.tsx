import * as Cinnabun from "cinnabun"
import { ComponentChild } from "cinnabun/src/types"

export default function Template({ children }: { children: ComponentChild[] }) {
  return (
    <>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body>
        <h1>Main template</h1>
        {...children}
      </body>
    </>
  )
}
