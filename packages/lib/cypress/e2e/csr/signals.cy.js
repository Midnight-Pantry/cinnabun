/// <reference types="cypress" />

describe("signals", () => {
  beforeEach(() => {
    const port = Cypress.env("port")
    cy.visit(`http://localhost:${port}`)
  })

  it("when the button is clicked, the input's value is updated", () => {
    cy.get("main button").click().click().click()
    cy.get("main input").should("have.value", "3")
  })

  it("when the input is changed to 123, the h1's text becomes 123", () => {
    cy.get("main input").type("123")
    cy.get("main h1").should("have.text", "123")
  })
})
