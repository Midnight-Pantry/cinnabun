"use strict"
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
// Object.defineProperty(exports, "__esModule", { value: true })
const fs_1 = __importDefault(require("fs"))

const replaceDollarFunctions = () => ({
  name: "dollar-async-function-plugin",
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const contents = await fs_1.default.promises.readFile(args.path, "utf8")

      const transformedContents = contents.replace(
        /async function\s+(\$[\w\d]+)\(\): Promise<[\w\d]+>\s*{(?:[^{}]*|{(?:[^{}]*|{(?:[^{}]*|{[^{}]*})*})*})*}/gm,
        (match, p1) => `async function ${p1}() {}`
      )
      return { contents: transformedContents, loader: "tsx" }
    })
  },
})

module.exports = {
  replaceDollarFunctions,
}
