import fs from "fs"

export const CB_ROUTE_MANIFEST = JSON.parse(
  fs.readFileSync("./.cb/route-manifest.json", "utf8")
)
