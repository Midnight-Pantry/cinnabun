const fs = require("fs")
const path = require("path")

const postbuild = () => {
  //fs.unlinkSync(path.join("app", "FileRouter.tsx"))
}

module.exports = {
  postbuild,
}
