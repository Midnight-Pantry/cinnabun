import { JSDOM } from "jsdom"
const { window } = new JSDOM()
global.document = window.document
global.window = global.document.defaultView!

import { Component } from ".."
import { Cinnabun } from "../cinnabun"
import { DomInterop } from "../domInterop"
import { expect } from "chai"
import "mocha"

declare global {
  namespace NodeJS {
    interface Global {
      document: Document
      window: Window
      navigator: Navigator
    }
  }
}
Object.assign(Cinnabun, { isClient: true })

describe("When rendered, a component", () => {
  beforeEach(() => {
    const { window } = new JSDOM()
    global.document = window.document
    global.window = global.document.defaultView!
  })

  describe("with primitive children", () => {
    const component = new Component("div", {
      children: ["test", " ", 123],
    })
    const rendered = DomInterop.render(component)
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, () => {
      expect((rendered as HTMLDivElement).outerHTML).to.equal(expected)
    })
  })
  describe("with primitive func children", () => {
    const component = new Component("div", {
      children: [() => "test", () => " ", () => 123],
    })
    const rendered = DomInterop.render(component)
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, () => {
      expect((rendered as HTMLDivElement).outerHTML).to.equal(expected)
    })
  })
  describe("with componentFunc children", () => {
    const component = new Component("div", {
      children: [
        () =>
          new Component("p", {
            children: ["test"],
          }),
        () =>
          new Component("p", {
            children: [123],
          }),
      ],
    })
    const rendered = DomInterop.render(component)
    const expected = "<div><p>test</p><p>123</p></div>"

    it(`produces the HTML: ${expected}`, () => {
      expect((rendered as HTMLDivElement).outerHTML).to.equal(expected)
    })
  })
})
