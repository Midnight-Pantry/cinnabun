import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      config.env.port = 5173
      // implement node event listeners here
      return config
    },
  },
})
