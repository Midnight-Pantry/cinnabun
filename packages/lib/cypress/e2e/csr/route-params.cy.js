/// <reference types="cypress" />

describe("route-params", () => {
  beforeEach(() => {
    const port = Cypress.env("port")
    cy.visit(`http://localhost:${port}/nested-routing/test123`)
  })

  it("should display the route parameter value, 'test123'", () => {
    cy.get("main h1").should("have.text", "test123")
  })
})
