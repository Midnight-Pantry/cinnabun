/// <reference types="cypress" />

describe("example to-do app", () => {
  beforeEach(() => {
    const port = Cypress.env("port")
    cy.visit(`http://localhost:${port}/todo`)
  })

  const todoItem = "main .todo-list li"

  it("displays two todo items by default", () => {
    cy.get(todoItem).should("have.length", 2)

    cy.get(todoItem)
      .first()
      .children()
      .first()
      .should("have.value", "Make a coffee")
    cy.get(todoItem)
      .last()
      .children()
      .first()
      .should("have.value", "Write a cool new app")
  })

  it("can add new todo items", () => {
    const newItem = "Feed the cat"

    cy.get("input[placeholder='Add a new item']").type(`${newItem}{enter}`)

    cy.get(todoItem)
      .should("have.length", 3)
      .last()
      .children()
      .first()
      .should("have.value", newItem)
  })

  it("can check off an item as completed", () => {
    cy.get(todoItem).first().find("button").last().click()

    cy.get(todoItem + ' input[value="Make a coffee"]').should("not.exist")
  })
})
