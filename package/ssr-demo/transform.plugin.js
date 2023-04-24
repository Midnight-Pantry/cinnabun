;+"use strict"
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, "__esModule", { value: true })
exports.findComments = exports.mustIgnore = void 0
const fs_1 = __importDefault(require("fs"))
const ignorePlugin = (opts) => {
  return {
    name: "ignore-with-comments-plugin",
    setup: (build) => {
      // build.onResolve({ filter: /.*/, namespace: 'ignore' }, (args) => {
      //   return {
      //     path: args.path,
      //     namespace: 'ignore',
      //   };
      // });
      build.onLoad(
        {
          filter: /\.(ts|tsx)$/,
        },
        async (args) => {
          const text = await fs_1.default.promises.readFile(args.path, "utf8")
          const res = findComments(text)
          if (
            mustIgnore(
              res,
              opts === null || opts === void 0 ? void 0 : opts.ignore
            )
          ) {
            return {
              contents: "const dummy = {}; export default dummy;",
              loader: "ts",
            }
          }
          const type = args.path.endsWith(".ts") ? "ts" : "tsx"
          return {
            contents: text,
            loader: type,
          }
        }
      )
      build.onLoad(
        {
          filter: /\.(js|jsx)$/,
        },
        async (args) => {
          const text = await fs_1.default.promises.readFile(args.path, "utf8")
          const res = findComments(text)
          if (
            mustIgnore(
              res,
              opts === null || opts === void 0 ? void 0 : opts.ignore
            )
          ) {
            return {
              contents: `
              var dummy = {};
              Object.defineProperty(exports, "__esModule", {
                value: true
              });
              exports["default"] = dummy;
              `,
              loader: "js",
            }
          }
          const type = args.path.endsWith(".js") ? "js" : "jsx"
          return {
            contents: text,
            loader: type,
          }
        }
      )
    },
  }
}
function mustIgnore(comments, ignore) {
  if (comments.length === 0) {
    return false
  }
  if (!ignore) {
    return true
  }
  const reducer = (prev, curr) => {
    return prev && comments.find((el) => el === curr || el === "") !== undefined
  }
  return ignore.reduce(reducer, true)
}
exports.mustIgnore = mustIgnore
function findComments(text) {
  const commentRegex = /^\s*\/\* use server ([^\s\*]*)/gm
  const res = []
  let matches
  do {
    matches = commentRegex.exec(text)
    if (matches && matches.length > 1) {
      res.push(matches[1])
    }
  } while (matches !== null)
  return res
}
exports.findComments = findComments
const pluginFactory = (opts) => {
  return ignorePlugin(opts)
}
exports.default = pluginFactory
//# sourceMappingURL=plugin.js.map
