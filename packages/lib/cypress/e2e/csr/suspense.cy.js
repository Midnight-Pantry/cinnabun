/// <reference types="cypress" />

describe("suspense", () => {
  beforeEach(() => {
    const port = Cypress.env("port")
    cy.visit(`http://localhost:${port}/suspense`)
  })

  it("when the component renders, it should initially display a loading indicator", () => {
    cy.get("main p").should("exist").should("have.text", "loading...")
  })
  it("when the component has loaded, it should display a list", () => {
    cy.get("main ul").should("exist")
  })

  describe("with the 'prefetch' flag", () => {
    it("should display prefetched content", async () => {
      cy.get("header").should("have.text", "prefetched!")
    })
  })
})
