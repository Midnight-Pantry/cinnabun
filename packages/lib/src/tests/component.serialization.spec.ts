import { Component, Signal } from ".."
import { Cinnabun } from "../cinnabun"
import { SSR } from "../ssr"
import { expect } from "chai"
import { logger } from "./logging"
import "mocha"

const logStep = logger("component.serialization")

describe("When serialized, a component", () => {
  describe("with primitive children", () => {
    logStep("A0")
    const instance = new Cinnabun()
    const component = new Component("div", {
      children: ["test", " ", 123],
    })
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, async () => {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal(expected)
    })
  })
  describe("with primitive func children", () => {
    logStep("A1")
    const instance = new Cinnabun()
    const component = new Component("div", {
      children: [() => "test", () => " ", () => 123],
    })
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, async () => {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal(expected)
    })
  })
  describe("with componentFunc children", () => {
    logStep("A2")
    const instance = new Cinnabun()
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

    it(`produces the HTML: ${expected}`, async () => {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal(expected)
    })
  })
  describe("with watch+bind props", () => {
    logStep("A3")
    const instance = new Cinnabun()
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
    const expected = "<div><p>test 123</p></div>"

    it(`produces the HTML: ${expected}`, async () => {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal(expected)
    })
  })
  describe("to render dynamic children", () => {
    logStep("A4")
    const instance = new Cinnabun()
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
    const expected = "<ul><li>test</li><li>123</li></ul>"

    it(`produces the HTML: ${expected}`, async () => {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal(expected)
    })
  })
})
