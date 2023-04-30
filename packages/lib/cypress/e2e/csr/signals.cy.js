/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

describe("two-way-binding", () => {
  beforeEach(() => {
    const port = Cypress.env("port")
    cy.visit(`http://localhost:${port}`)
  })

  it("when the button is clicked, the input's value is 1", () => {
    cy.get("button").click()
    cy.get("input").should("have.value", "1")
  })
})
