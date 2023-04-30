/// <reference types="cypress" />
const { generateUUID } = require("../util")

const port = Cypress.env("port")

const preAuth = async function () {
  await cy.request("POST", `http://localhost:${port}/create-account`, {
    username: generateUUID(),
    password: "123",
  })
}

describe("requestData", () => {
  it("should display the correct route", async () => {
    cy.request(`http://localhost:${port}/context`)
      .its("body")
      .should("include", '<button disabled="true">Subtract</button>')
  })

  it("should display the 'Log in' button when we aren't authenticated", async () => {
    cy.request(`http://localhost:${port}`)
      .its("body")
      .should("include", "<button>Log in</button>")
  })
  it("should display the 'Log out' button when we are authenticated", async () => {
    await preAuth()
    cy.request(`http://localhost:${port}`)
      .its("body")
      .should("include", "<button>Log out</button>")
  })
})
