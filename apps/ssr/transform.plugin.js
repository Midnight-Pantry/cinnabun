//"use strict"
const fs = require("fs")

const regexPatterns = {
  ServerPromise:
    /async function\s+(\w+)\s*\([^)]*\)\s*:\s*ServerPromise\s*<[^>]*>\s*{(?:[^{}]*|{(?:[^{}]*|{(?:[^{}]*|{[^{}]*})*})*})*}/gm,
  $fn: /async function\s+(\$[\w\d]+)\(\): Promise<[\w\d]+>\s*{(?:[^{}]*|{(?:[^{}]*|{(?:[^{}]*|{[^{}]*})*})*})*}/gm,
}

const replaceServerFunctions = (rgxPattern) => ({
  name: "function-replacer-plugin",
  setup(build) {
    build.onLoad({ filter: /\.tsx?$/ }, async (args) => {
      const contents = await fs.promises.readFile(args.path, "utf8")

      const transformedContents = contents.replace(
        rgxPattern,
        (match, p1) => `async function ${p1}() {}`
      )
      return { contents: transformedContents, loader: "tsx" }
    })
  },
})

module.exports = {
  replaceServerFunctions,
  regexPatterns,
}
