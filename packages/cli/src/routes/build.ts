// TypeScript (.ts)
import { Command, Option } from "commander"

export default new Command("build")
  .description("build your cinnabun project")
  .addOption(
    new Option("-o, --output <output>", "output directory").default("dist")
  )
  .action(() => {
    throw new Error("Not yet implemented")
  })
