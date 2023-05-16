import { Cinnabun } from "../../cinnabun"
import { Component } from "../../component"
import { SuspenseComponent } from "../../suspense"
import { SSR } from "../../ssr"
import { sleep } from "../../utils"
import { expect } from "chai"
import "mocha"

describe("When serialized, a Suspense Component", function () {
  describe("with the 'prefetch' flag", function () {
    const cinnabunInstance = new Cinnabun()
    const component = new SuspenseComponent("", {
      prefetch: true,
      promise: async () => {
        await sleep(20)
        return new Promise((res) => res([1, 2, 3]))
      },
      children: [
        (loading, data) =>
          new Component("p", {
            children: loading
              ? ["...loading"]
              : data.map((n) => new Component("span", { children: [n] })),
          }),
      ],
    })
    it("will wait for its' promise to resolve", async function () {
      const { html } = await SSR.serverBake(component, { cinnabunInstance })
      expect(html).to.equal("<p><span>1</span><span>2</span><span>3</span></p>")
    })
  })
  describe("without the 'prefetch' flag", function () {
    const cinnabunInstance = new Cinnabun()
    const component = new SuspenseComponent("", {
      promise: async () => {
        await sleep(20)
        return new Promise((res) => res([1, 2, 3]))
      },
      children: [
        (loading, data) =>
          new Component("p", {
            children: loading
              ? ["...loading"]
              : data.map((n) => new Component("span", { children: [n] })),
          }),
      ],
    })
    it("will render its' loading state", async function () {
      const { html } = await SSR.serverBake(component, { cinnabunInstance })
      expect(html).to.equal("<p>...loading</p>")
    })
  })
})
