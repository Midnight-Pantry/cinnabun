//export { Component } from "./component"
const src = require("./dist")
const { Signal, createSignal } = require("./dist/signal")
const { SSR } = require("./dist/ssr")
//const { Suspense } = require("./dist/suspense")
const { Cinnabun, h } = require("./dist/cinnabun")

module.exports = {
  default: src,
  Cinnabun,
  h,
  SSR,
  Signal,
  createSignal,
  // Suspense,
}
