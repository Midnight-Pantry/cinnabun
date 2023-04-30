import { SuspenseComponent } from "../../suspense"
import { Component } from "../.."
import { Cinnabun } from "../../cinnabun"
import { SSR } from "../../ssr"
import { expect } from "chai"
import "mocha"
import { sleep } from "../../utils"

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
