import { Command } from "commander"
import fs from "fs"
import path from "path"
import globalModules from "global-modules"

const packageDirectoryName = "cinnabun-cli"
const packageDirectory = path.join(globalModules, packageDirectoryName)

const baseDir = path.join(process.cwd(), ".cb")

const createServerFiles = () => {
  const serverDir = path.join(baseDir, "server")
  if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir)
  const serverCreator = path.join(packageDirectory, "src", "build", "server.ts")
  console.log("serverCreator path", serverCreator)
  console.log("serverCreator exists", fs.existsSync(serverCreator))
}

const ensureWorkingDir = () => {
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir)
  createServerFiles()
}

export default new Command("init")
  .description("initialize your cinnabun project")
  .action(() => {
    console.log("Preparing project files...")
    ensureWorkingDir()
    console.log(
      "Cinnabun is ready. Exec 'cinnabun run' to launch the development server!"
    )
  })
