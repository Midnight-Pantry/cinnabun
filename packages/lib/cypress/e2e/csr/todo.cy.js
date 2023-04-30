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

describe("example to-do app", () => {
  beforeEach(() => {
    const port = Cypress.env("port")
    cy.visit(`http://localhost:${port}/todo`)
  })

  it("displays two todo items by default", () => {
    cy.get(".todo-list li").should("have.length", 2)

    cy.get(".todo-list li").first().should("have.text", "Make a coffee")
    cy.get(".todo-list li").last().should("have.text", "Write a cool new app")
  })

  it("can add new todo items", () => {
    const newItem = "Feed the cat"

    cy.get("input[placeholder='Add a new item']").type(`${newItem}{enter}`)

    cy.get(".todo-list li")
      .should("have.length", 3)
      .last()
      .should("have.text", newItem)
  })

  it("can check off an item as completed", () => {
    const itemToRemove = "Write a cool new app"
    cy.contains(itemToRemove).parent().find("input[type=checkbox]").check()

    cy.contains(itemToRemove).should("not.exist")
  })
})
