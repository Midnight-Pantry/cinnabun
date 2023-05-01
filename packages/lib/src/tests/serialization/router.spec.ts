import { Route, Router } from "../../router"
import { Component, Signal } from "../.."
import { Cinnabun } from "../../cinnabun"
import { SSR } from "../../ssr"
import { expect } from "chai"
import "mocha"

describe("When serialized, a Router Component", function () {
  it("will only render the request path's corresponding Route Component", async function () {
    const cinnabunInstance = new Cinnabun()
    cinnabunInstance.setServerRequestData({ path: "/test", data: {} })

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

    const { html } = await SSR.serverBake(router, { cinnabunInstance })
    expect(html).to.equal("<h1>Test</h1>")
  })

  it("will provide path params to child routes, and they can provide them to their child component", async function () {
    const cinnabunInstance = new Cinnabun()
    cinnabunInstance.setServerRequestData({ path: "/moose", data: {} })

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

    const { html } = await SSR.serverBake(router, { cinnabunInstance })
    expect(html).to.equal("<h1>moose</h1>")
  })
})
