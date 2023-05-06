import React from "react"
import { render } from "ink"
import meow from "meow"
import { CONFIG } from "./config.js"
import App from "./App.js"

const cli = meow(
  `
	Usage
	  $ ${CONFIG.title} 🥯
 
	Options
		--name  Your name

	Examples
	  $ my-ink-cli --name=Jane
	  Hello, Jane
`,
  {
    importMeta: import.meta,
    flags: {
      name: {
        type: "string",
      },
    },
  }
)

render(<App name={cli.flags.name} />)
