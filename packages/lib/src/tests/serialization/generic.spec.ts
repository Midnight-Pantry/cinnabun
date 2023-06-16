import { Component, Signal } from "../.."
import { Cinnabun } from "../../cinnabun"
import { SSR } from "../../ssr"
import { expect } from "chai"
import "mocha"

describe("When serialized, a Generic Component", function () {
  describe("with primitive children", function () {
    const cinnabunInstance = new Cinnabun()
    const component = new Component("div", {
      children: ["test", " ", 123],
    })
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, async function () {
      const { html } = await SSR.serverBake(component, {
        cinnabunInstance,
        stream: null,
      })
      expect(html).to.include(expected)
    })
  })
  describe("with primitive func children", function () {
    const cinnabunInstance = new Cinnabun()
    const component = new Component("div", {
      children: [() => "test", () => " ", () => 123],
    })
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, async function () {
      const { html } = await SSR.serverBake(component, {
        cinnabunInstance,
        stream: null,
      })
      expect(html).to.include(expected)
    })
  })
  describe("with componentFunc children", function () {
    const cinnabunInstance = new Cinnabun()
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
    const expected = "<div><p>test</p><p>123</p></div>"

    it(`produces the HTML: ${expected}`, async function () {
      const { html } = await SSR.serverBake(component, {
        cinnabunInstance,
        stream: null,
      })
      expect(html).to.include(expected)
    })
  })
  describe("with watch+bind props", function () {
    it(`can conditionally render`, async function () {
      const cinnabunInstance = new Cinnabun()
      const signal = new Signal(123)
      const parentComponent = new Component("div", {
        id: "parent",
        children: [
          new Component("div", {
            watch: signal,
            "bind:visible": () => signal.value !== 123,
          }),
        ],
      })
      const { html } = await SSR.serverBake(parentComponent, {
        cinnabunInstance,
        stream: null,
      })
      expect(html).to.include('<div id="parent"></div>')
    })

    it("can dynamically render children", async function () {
      const cinnabunInstance = new Cinnabun()
      const signal = new Signal(["test", "123"])
      const component = new Component("ul", {
        watch: signal,
        "bind:visible": true,
        children: signal.value.map(
          (v) => new Component("li", { children: [v] })
        ),
      })
      const { html } = await SSR.serverBake(component, {
        cinnabunInstance,
        stream: null,
      })
      expect(html).to.include("<ul><li>test</li><li>123</li></ul>")
    })
  })
})
