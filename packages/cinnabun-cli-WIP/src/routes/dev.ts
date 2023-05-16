import { Command } from "commander"

export default new Command("dev")
  .description("start your cinnabun project")
  .action(() => {
    throw new Error("Not yet implemented")
  })
