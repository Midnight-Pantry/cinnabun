/// <reference types="cypress" />

const port = Cypress.env("port")

describe("Suspense Component", () => {
  describe("with the 'prefetch' flag", () => {
    it("should display prefetched content", async () => {
      cy.request(`http://localhost:${port}/context`)
        .its("body")
        .should(
          "include",
          `<ul>${["this", "was", "prefetched!"]
            .map((str) => `<li>${str}</li>`)
            .join("")}</ul>`
        )
    })
  })
})
