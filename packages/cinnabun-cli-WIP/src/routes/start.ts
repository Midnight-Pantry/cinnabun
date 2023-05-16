import { Command, Option } from "commander"

export default new Command("start")
  .description("start your cinnabun project")
  .addOption(new Option("-p, --port <port>", "port to run on").default("3000"))
  .addOption(
    new Option("-h, --host <host>", "host to run on").default("localhost")
  )
  .action(async ({ port, host }) => {
    console.log("start", port, host)
  })
