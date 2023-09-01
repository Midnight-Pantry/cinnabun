/// <reference types="cypress" />

describe("context", () => {
  beforeEach(() => {
    const port = Cypress.env("port")
    cy.visit(`http://localhost:${port}/context`)
  })

  it("when the Add button is clicked 3 times, it disables", () => {
    cy.get("main button").last().click().click().click()
    cy.get("main button").last().should("have.attr", "disabled")
    cy.get("main h1").should("have.text", "15")
  })

  it("when the value is greater than 5, a message is displayed", () => {
    cy.get("main button").last().click().click()
    cy.get("main p").should("exist")
  })
})
