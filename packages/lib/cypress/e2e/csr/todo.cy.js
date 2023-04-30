/// <reference types="cypress" />

describe("example to-do app", () => {
  beforeEach(() => {
    const port = Cypress.env("port")
    cy.visit(`http://localhost:${port}/todo`)
  })

  const todoItem = "main .todo-list li"

  it("displays two todo items by default", () => {
    cy.get(todoItem).should("have.length", 2)

    cy.get(todoItem).first().should("have.text", "Make a coffee")
    cy.get(todoItem).last().should("have.text", "Write a cool new app")
  })

  it("can add new todo items", () => {
    const newItem = "Feed the cat"

    cy.get("input[placeholder='Add a new item']").type(`${newItem}{enter}`)

    cy.get(todoItem)
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
