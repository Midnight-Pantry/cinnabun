import { SuspenseComponent } from "../suspense"
import { Component, Signal } from ".."
import { Cinnabun } from "../cinnabun"
import { SSR } from "../ssr"
import { expect } from "chai"
import "mocha"
import { sleep } from "../utils"

describe("When serialized, a Generic Component", () => {
  describe("with primitive children", () => {
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
    it(`can conditionally render`, async () => {
      const instance = new Cinnabun()
      const signal = new Signal(123)
      const component = new Component("div", {
        watch: signal,
        "bind:render": () => signal.value !== 123,
      })
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal("")
    })

    it("can dynamically render children", async () => {
      const instance = new Cinnabun()
      const signal = new Signal(["test", "123"])
      const component = new Component("ul", {
        watch: signal,
        "bind:render": true,
        children: signal.value.map(
          (v) => new Component("li", { children: [v] })
        ),
      })
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal("<ul><li>test</li><li>123</li></ul>")
    })
  })
})

describe("When serialized, a Suspense Component", () => {
  describe("with the 'prefetch' flag", () => {
    const instance = new Cinnabun()
    const component = new SuspenseComponent("", {
      prefetch: true,
      promise: async () => {
        await sleep(20)
        return new Promise<number[]>((res) => res([1, 2, 3]))
      },
      children: [
        (loading: boolean, data: number[]) =>
          new Component("p", {
            children: loading
              ? ["...loading"]
              : data.map((n) => new Component("span", { children: [n] })),
          }),
      ],
    })
    it("will wait for its' promise to resolve", async () => {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal("<p><span>1</span><span>2</span><span>3</span></p>")
    })
  })
  describe("without the 'prefetch' flag", () => {
    const instance = new Cinnabun()
    const component = new SuspenseComponent("", {
      promise: async () => {
        await sleep(20)
        return new Promise<number[]>((res) => res([1, 2, 3]))
      },
      children: [
        (loading: boolean, data: number[]) =>
          new Component("p", {
            children: loading
              ? ["...loading"]
              : data.map((n) => new Component("span", { children: [n] })),
          }),
      ],
    })
    it("will render its' loading state", async () => {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal("<p>...loading</p>")
    })
  })
})
