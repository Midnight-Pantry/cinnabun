import JSDOM from "./jsdom"
// import { Component, Signal } from ".."
// import { DomInterop } from "../domInterop"
// import { expect } from "chai"
import "mocha"

beforeEach(() => {
  const { window } = new JSDOM()
  global.document = window.document
  global.window = global.document.defaultView!
})

describe("When a component watches a signal", () => {
  // describe("and the signal's value changes", () => {
  //   const signal = new Signal(123)
  //   const component = new Component("div", {
  //     children: [
  //       new Component("", {
  //         watch: signal,
  //         "bind:render": () => true,
  //         children: [() => `test ${signal.value}`],
  //       }),
  //     ],
  //   })
  //   const rendered = DomInterop.render(component)
  //   const expected = "<div>test 456</div>"
  //   signal.value = 456
  //   it(`should update the DOM to produce the following HTML: ${expected}`, () => {
  //     expect((rendered as HTMLDivElement).outerHTML).to.equal(expected)
  //   })
  // })
})
