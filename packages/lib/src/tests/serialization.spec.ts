import { SuspenseComponent } from "../suspense"
import { Route, Router } from "../router"
import { Component, Signal } from ".."
import { Cinnabun } from "../cinnabun"
import { SSR } from "../ssr"
import { expect } from "chai"
import "mocha"
import { sleep } from "../utils"

describe("When serialized, a Generic Component", function () {
  describe("with primitive children", function () {
    const instance = new Cinnabun()
    const component = new Component("div", {
      children: ["test", " ", 123],
    })
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, async function () {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal(expected)
    })
  })
  describe("with primitive func children", function () {
    const instance = new Cinnabun()
    const component = new Component("div", {
      children: [() => "test", () => " ", () => 123],
    })
    const expected = "<div>test 123</div>"

    it(`produces the HTML: ${expected}`, async function () {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal(expected)
    })
  })
  describe("with componentFunc children", function () {
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

    it(`produces the HTML: ${expected}`, async function () {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal(expected)
    })
  })
  describe("with watch+bind props", function () {
    it(`can conditionally render`, async function () {
      const instance = new Cinnabun()
      const signal = new Signal(123)
      const component = new Component("div", {
        watch: signal,
        "bind:render": () => signal.value !== 123,
      })
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal("")
    })

    it("can dynamically render children", async function () {
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

describe("When serialized, a Suspense Component", function () {
  describe("with the 'prefetch' flag", function () {
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
    it("will wait for its' promise to resolve", async function () {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal("<p><span>1</span><span>2</span><span>3</span></p>")
    })
  })
  describe("without the 'prefetch' flag", function () {
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
    it("will render its' loading state", async function () {
      const { html } = await SSR.serverBake(component, instance)
      expect(html).to.equal("<p>...loading</p>")
    })
  })
})

describe("When serialized, a Router Component", function () {
  it("will only render the request path's corresponding Route Component", async function () {
    const instance = new Cinnabun()
    instance.setServerRequestData({ path: "/test", data: {} })

    const pathStore = new Signal<string>("/")
    const router = Router({ store: pathStore }, [
      Route({
        path: "/",
        component: new Component("h1", { children: ["Home"] }),
      }),
      Route({
        path: "/test",
        component: new Component("h1", { children: ["Test"] }),
      }),
    ])

    const { html } = await SSR.serverBake(router, instance)
    expect(html).to.equal("<h1>Test</h1>")
  })

  it("will provide path params to child routes, and they can provide them to their child component", async function () {
    const instance = new Cinnabun()
    instance.setServerRequestData({ path: "/moose", data: {} })

    const pathStore = new Signal<string>("/moose")
    const router = Router({ store: pathStore }, [
      Route({
        path: "/",
        component: new Component("h1", { children: ["Home"] }),
      }),
      Route({
        path: "/:myparam",
        component: ({ params }) =>
          new Component("h1", { children: [params.myparam] }),
      }),
    ])

    const { html } = await SSR.serverBake(router, instance)
    expect(html).to.equal("<h1>moose</h1>")
  })
})
