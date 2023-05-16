import { Cinnabun } from "../../cinnabun"
import { Component } from "../../component"
import { Signal } from "../../signal"
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
      const { html } = await SSR.serverBake(component, { cinnabunInstance })
      expect(html).to.equal(expected)
    })
  })
  describe("with primitive func children", function () {
    const cinnabunInstance = new Cinnabun()
    const component = new Component("div", {
      children: [() => "test", () => " ", () => 123],
    })
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, async function () {
      const { html } = await SSR.serverBake(component, { cinnabunInstance })
      expect(html).to.equal(expected)
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
      const { html } = await SSR.serverBake(component, { cinnabunInstance })
      expect(html).to.equal(expected)
    })
  })
  describe("with watch+bind props", function () {
    it(`can conditionally render`, async function () {
      const cinnabunInstance = new Cinnabun()
      const signal = new Signal(123)
      const component = new Component("div", {
        watch: signal,
        "bind:render": () => signal.value !== 123,
      })
      const { html } = await SSR.serverBake(component, { cinnabunInstance })
      expect(html).to.equal("")
    })

    it("can dynamically render children", async function () {
      const cinnabunInstance = new Cinnabun()
      const signal = new Signal(["test", "123"])
      const component = new Component("ul", {
        watch: signal,
        "bind:render": true,
        children: signal.value.map(
          (v) => new Component("li", { children: [v] })
        ),
      })
      const { html } = await SSR.serverBake(component, { cinnabunInstance })
      expect(html).to.equal("<ul><li>test</li><li>123</li></ul>")
    })
  })
})
