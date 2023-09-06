// simple http server to serve static files from dist

import http from "http"
import path from "path"
import fs from "fs"
import url from "url"
import { pathToFileURL } from "node:url"

const PORT = 3000

http
  .createServer(function (req, res) {
    const parsedUrl = url.parse(req.url)
    const pathname = pathToFileURL(
      path.join("dist", "generated", parsedUrl.pathname)
    ).pathname

    const ext = path.parse(pathname).ext
    const map = {
      ".ico": "image/x-icon",
      ".html": "text/html",
      ".js": "text/javascript",
      ".json": "application/json",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".wav": "audio/wav",
      ".mp3": "audio/mpeg",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
      ".doc": "application/msword",
    }

    let fPath =
      pathname.replace(ext, "") +
      (req.url === "/" ? "index" : "") +
      (ext || ".html")

    if (fPath.startsWith("/")) fPath = fPath.slice(1)
    console.log("fPath", fPath)

    if (!fs.existsSync(fPath)) {
      res.statusCode = 404
      res.end()
      return
    }

    fs.readFile(fPath, function (err, data) {
      if (err) {
        res.statusCode = 500
        res.end()
      } else {
        res.setHeader("Content-type", map[ext || ".html"] || "text/plain")
        res.end(data)
      }
    })
  })
  .listen(parseInt(PORT), "0.0.0.0", undefined, () => {
    console.log(`Server listening on port ${PORT}`)
  })
