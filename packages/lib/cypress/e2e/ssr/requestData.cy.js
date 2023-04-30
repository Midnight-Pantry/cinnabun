/// <reference types="cypress" />

describe("requestData", () => {
  it("should display the correct route", async () => {
    const port = Cypress.env("port")
    cy.request(`http://localhost:${port}/context`)
      .its("body")
      .should("include", '<button disabled="true">Subtract</button>')
  })

  it("should display the 'Log in' button when we're not authenticated", async () => {
    const port = Cypress.env("port")
    cy.request(`http://localhost:${port}`)
      .its("body")
      .should("include", "<button>Log in</button>")
  })
})
