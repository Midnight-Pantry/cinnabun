const { Cinnabun, h } = require("./dist/cinnabun")
const { SSR } = require("./dist/ssr")

module.exports = {
  default: require("./dist"),
  Cinnabun,
  h,
  SSR,
}
