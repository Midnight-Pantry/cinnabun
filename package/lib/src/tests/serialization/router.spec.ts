import { Route, Router } from "../../router/router.js"
import { Component, Signal } from "../../index.js"
import { Cinnabun } from "../../cinnabun.js"
import { SSR } from "../../ssr.js"
import { expect } from "chai"
import "mocha"

describe("When serialized, a Router Component", function () {
  it("will only render the request path's corresponding Route Component", async function () {
    const cinnabunInstance = new Cinnabun()
    cinnabunInstance.setServerRequestData({ path: "/test", data: {} })

    const router = Router({ store: new Signal("/") }, [
      Route({
        path: "/",
        component: new Component("h1", { children: ["Home"] }),
      }),
      Route({
        path: "/test",
        component: new Component("h1", { children: ["Test"] }),
      }),
    ])

    const { html } = await SSR.serverBake(router, {
      cinnabunInstance,
      stream: null,
    })
    expect(html).to.contain("<h1>Test</h1>")
  })

  it("will provide path params to child routes, and they can provide them to their child component", async function () {
    const cinnabunInstance = new Cinnabun()
    cinnabunInstance.setServerRequestData({ path: "/moose", data: {} })

    const pathStore = new Signal("/moose")
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

    const { html } = await SSR.serverBake(router, {
      cinnabunInstance,
      stream: null,
    })
    expect(html).to.include("<h1>moose</h1>")
  })
})
