"use strict"
const fs = require("fs")
const { prebuild } = require("./prebuild")

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

const generateFileRouter = () => ({
  name: "fileRoute-generator-plugin",
  setup(build) {
    build.onLoad({ filter: /generated\\fileRouter\.tsx?$/ }, async (args) => {
      console.log("reading fileRouter")
      const contents = await fs.promises.readFile(args.path, "utf8")

      const replaced = contents
        .replace("//@ts-expect-error TS2552", "")
        .replace("var FileRoutes = $FILE_ROUTES", prebuild())

      console.log("~~~~~~~~ fileRouter contents\n", contents)
      console.log("~~~~~~~~ fileRouter replaced", replaced)

      return {
        contents: replaced,
        loader: "tsx",
      }
    })
  },
})

module.exports = {
  replaceServerFunctions,
  regexPatterns,
  generateFileRouter,
}
