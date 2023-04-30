import JSDOM from "./jsdom"
import { Component, Signal } from ".."
import { DomInterop } from "../domInterop"
import { expect } from "chai"
import "mocha"

beforeEach(() => {
  const { window } = new JSDOM()
  global.document = window.document
  global.window = global.document.defaultView!
})

describe("When rendered, a component", () => {
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

describe("When mounted, a component that uses watch + bind", () => {
  describe("to conditionally render", () => {
    const signal = new Signal(123)
    const component = new Component("div", {
      children: [
        new Component("p", {
          watch: signal,
          "bind:render": () => signal.value === 123,
          children: ["test 123"],
        }),
      ],
    })
    const rendered = DomInterop.render(component)
    const expected = "<div><p>test 123</p></div>"

    it(`produces the HTML: ${expected}`, () => {
      expect((rendered as HTMLDivElement).outerHTML).to.equal(expected)
    })
  })

  describe("to render dynamic children", () => {
    const signal = new Signal(["test", "123"])
    const component = new Component("ul", {
      watch: signal,
      "bind:render": true,
      children: [
        () =>
          new Component("", {
            children: signal.value.map(
              (v) => new Component("li", { children: [v] })
            ),
          }),
      ],
    })
    const rendered = DomInterop.render(component)
    const expected = "<ul><li>test</li><li>123</li></ul>"

    it(`produces the HTML: ${expected}`, () => {
      expect((rendered as HTMLDivElement).outerHTML).to.equal(expected)
    })
  })
})
